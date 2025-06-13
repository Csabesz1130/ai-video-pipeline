import googleTrends from 'google-trends-api';
import { Logger } from '../../../utils/logger';
import { GoogleTrendsData, ContentCategory } from '../types';

export class GoogleTrendsClient {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('GoogleTrendsClient');
  }

  /**
   * Kulcsszó népszerűségi adatok lekérése
   */
  async getKeywordTrends(
    keywords: string[],
    options: {
      startTime?: Date;
      endTime?: Date;
      geo?: string;
    } = {}
  ): Promise<GoogleTrendsData[]> {
    try {
      const results: GoogleTrendsData[] = [];

      for (const keyword of keywords) {
        const interestData = await this.getInterestOverTime(keyword, options);
        const relatedData = await this.getRelatedData(keyword, options);

        results.push({
          keyword,
          interest: this.calculateAverageInterest(interestData),
          relatedQueries: relatedData.queries,
          relatedTopics: relatedData.topics,
          geoDistribution: await this.getGeoDistribution(keyword, options),
          timelineData: interestData
        });
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to get keyword trends', { error, keywords });
      throw error;
    }
  }

  /**
   * Népszerűség időbeli alakulása
   */
  private async getInterestOverTime(
    keyword: string,
    options: any
  ): Promise<{ date: Date; value: number }[]> {
    try {
      const results = await googleTrends.interestOverTime({
        keyword,
        startTime: options.startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 nap
        endTime: options.endTime || new Date(),
        geo: options.geo || 'US'
      });

      const data = JSON.parse(results);
      return data.default.timelineData.map((item: any) => ({
        date: new Date(item.time * 1000),
        value: item.value[0]
      }));
    } catch (error) {
      this.logger.error('Failed to get interest over time', { error, keyword });
      return [];
    }
  }

  /**
   * Kapcsolódó keresések és témák
   */
  private async getRelatedData(
    keyword: string,
    options: any
  ): Promise<{ queries: string[]; topics: string[] }> {
    try {
      const [queriesResult, topicsResult] = await Promise.all([
        googleTrends.relatedQueries({
          keyword,
          startTime: options.startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endTime: options.endTime || new Date(),
          geo: options.geo || 'US'
        }),
        googleTrends.relatedTopics({
          keyword,
          startTime: options.startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endTime: options.endTime || new Date(),
          geo: options.geo || 'US'
        })
      ]);

      const queriesData = JSON.parse(queriesResult);
      const topicsData = JSON.parse(topicsResult);

      const queries = queriesData.default.rankedList[0]?.rankedKeyword
        ?.map((item: any) => item.query) || [];
      
      const topics = topicsData.default.rankedList[0]?.rankedKeyword
        ?.map((item: any) => item.topic.title) || [];

      return { queries, topics };
    } catch (error) {
      this.logger.error('Failed to get related data', { error, keyword });
      return { queries: [], topics: [] };
    }
  }

  /**
   * Földrajzi eloszlás
   */
  private async getGeoDistribution(
    keyword: string,
    options: any
  ): Promise<Record<string, number>> {
    try {
      const result = await googleTrends.interestByRegion({
        keyword,
        startTime: options.startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endTime: options.endTime || new Date(),
        geo: options.geo || 'US',
        resolution: 'COUNTRY'
      });

      const data = JSON.parse(result);
      const distribution: Record<string, number> = {};

      data.default.geoMapData.forEach((item: any) => {
        distribution[item.geoCode] = item.value[0];
      });

      return distribution;
    } catch (error) {
      this.logger.error('Failed to get geo distribution', { error, keyword });
      return {};
    }
  }

  /**
   * Átlagos népszerűség számítása
   */
  private calculateAverageInterest(timelineData: { date: Date; value: number }[]): number {
    if (timelineData.length === 0) return 0;
    
    const sum = timelineData.reduce((acc, item) => acc + item.value, 0);
    return Math.round(sum / timelineData.length);
  }

  /**
   * Feltörekvő témák keresése kategória alapján
   */
  async findEmergingTopics(category: ContentCategory): Promise<string[]> {
    try {
      // Kategória specifikus kulcsszavak
      const categoryKeywords: Record<ContentCategory, string[]> = {
        'finance': ['investing', 'stocks', 'crypto', 'money'],
        'business': ['entrepreneur', 'startup', 'business ideas', 'marketing'],
        'motivation': ['motivation', 'success', 'mindset', 'self improvement'],
        'top-lists': ['top 10', 'best', 'worst', 'ranked'],
        'education': ['learn', 'tutorial', 'how to', 'course'],
        'technology': ['tech', 'AI', 'gadgets', 'software'],
        'lifestyle': ['lifestyle', 'wellness', 'productivity', 'habits'],
        'entertainment': ['viral', 'trending', 'funny', 'amazing']
      };

      const keywords = categoryKeywords[category] || [];
      const emergingTopics: Set<string> = new Set();

      for (const keyword of keywords) {
        const relatedData = await this.getRelatedData(keyword, {});
        
        // Feltörekvő keresések hozzáadása
        relatedData.queries.slice(0, 5).forEach(q => emergingTopics.add(q));
        relatedData.topics.slice(0, 5).forEach(t => emergingTopics.add(t));
      }

      return Array.from(emergingTopics);
    } catch (error) {
      this.logger.error('Failed to find emerging topics', { error, category });
      return [];
    }
  }

  /**
   * Trend erősségének értékelése
   */
  async evaluateTrendStrength(keyword: string): Promise<{
    strength: 'weak' | 'moderate' | 'strong';
    score: number;
    momentum: 'declining' | 'stable' | 'growing';
  }> {
    try {
      const timelineData = await this.getInterestOverTime(keyword, {
        startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 nap
      });

      if (timelineData.length === 0) {
        return { strength: 'weak', score: 0, momentum: 'stable' };
      }

      // Átlagos népszerűség
      const avgInterest = this.calculateAverageInterest(timelineData);

      // Momentum számítása (utolsó 30 nap vs előző 60 nap)
      const recentData = timelineData.slice(-30);
      const olderData = timelineData.slice(0, -30);
      
      const recentAvg = this.calculateAverageInterest(recentData);
      const olderAvg = this.calculateAverageInterest(olderData);
      
      let momentum: 'declining' | 'stable' | 'growing';
      if (recentAvg > olderAvg * 1.2) {
        momentum = 'growing';
      } else if (recentAvg < olderAvg * 0.8) {
        momentum = 'declining';
      } else {
        momentum = 'stable';
      }

      // Trend erősség meghatározása
      let strength: 'weak' | 'moderate' | 'strong';
      if (avgInterest >= 70) {
        strength = 'strong';
      } else if (avgInterest >= 40) {
        strength = 'moderate';
      } else {
        strength = 'weak';
      }

      return {
        strength,
        score: avgInterest,
        momentum
      };
    } catch (error) {
      this.logger.error('Failed to evaluate trend strength', { error, keyword });
      return { strength: 'weak', score: 0, momentum: 'stable' };
    }
  }
}