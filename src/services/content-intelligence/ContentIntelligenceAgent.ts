import { Logger } from '../../utils/logger';
import { YouTubeAPIClient } from './clients/YouTubeAPIClient';
import { GoogleTrendsClient } from './clients/GoogleTrendsClient';
import { 
  ContentIntelligenceAgent,
  ContentAnalysisConfig,
  ContentIntelligenceResponse,
  YouTubeVideoData,
  CompetitorChannel,
  GoogleTrendsData,
  ContentOpportunity,
  ContentCategory,
  CompetitionLevel,
  MarketInsights,
  AudienceDemographics
} from './types';

export class ContentIntelligenceAgentImpl implements ContentIntelligenceAgent {
  private logger: Logger;
  private youtubeClient: YouTubeAPIClient;
  private trendsClient: GoogleTrendsClient;

  constructor(youtubeApiKey: string) {
    this.logger = new Logger('ContentIntelligenceAgent');
    this.youtubeClient = new YouTubeAPIClient(youtubeApiKey);
    this.trendsClient = new GoogleTrendsClient();
  }

  /**
   * Fő elemzési funkció - tartalmi lehetőségek azonosítása
   */
  async analyzeContentOpportunities(
    config: ContentAnalysisConfig
  ): Promise<ContentIntelligenceResponse> {
    try {
      this.logger.info('Starting content opportunity analysis', { config });

      // Párhuzamos adatgyűjtés
      const [
        trendingVideos,
        competitorData,
        keywordTrends,
        emergingTopics
      ] = await Promise.all([
        this.collectTrendingVideos(config),
        this.analyzeCompetitors(config.competitorChannels),
        this.analyzeKeywords(config.seedKeywords),
        this.findEmergingTopics(config.categories)
      ]);

      // Tartalmi lehetőségek azonosítása
      const opportunities = await this.identifyOpportunities(
        trendingVideos,
        competitorData,
        keywordTrends,
        emergingTopics,
        config
      );

      // Piaci elemzések generálása
      const marketInsights = this.generateMarketInsights(
        trendingVideos,
        competitorData,
        keywordTrends
      );

      // Javasolt lépések meghatározása
      const recommendedActions = this.generateRecommendations(
        opportunities,
        marketInsights
      );

      return {
        contentOpportunities: opportunities,
        marketInsights,
        recommendedActions,
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to analyze content opportunities', { error });
      throw error;
    }
  }

  /**
   * Trending témák lekérése
   */
  async getTrendingTopics(
    category: ContentCategory,
    limit: number = 50
  ): Promise<YouTubeVideoData[]> {
    return this.youtubeClient.getTrendingVideos(category, 'US', limit);
  }

  /**
   * Versenytárs elemzés
   */
  async analyzeCompetitors(channelIds: string[]): Promise<CompetitorChannel[]> {
    try {
      const competitors: CompetitorChannel[] = [];

      for (const channelId of channelIds) {
        const [channelDetails, recentVideos] = await Promise.all([
          this.youtubeClient.getChannelDetails(channelId),
          this.youtubeClient.getChannelVideos(channelId, 50)
        ]);

        // Teljesítmény metrikák számítása
        const averageViews = this.calculateAverageViews(recentVideos);
        const contentFrequency = this.calculateContentFrequency(recentVideos);
        const topVideos = this.findTopPerformingVideos(recentVideos, 5);
        const patterns = this.extractContentPatterns(recentVideos);

        competitors.push({
          channelId,
          channelName: channelDetails.channelName,
          subscriberCount: channelDetails.subscriberCount,
          videoCount: channelDetails.videoCount,
          averageViews,
          contentFrequency,
          topPerformingVideos: topVideos,
          contentPatterns: patterns
        });
      }

      return competitors;
    } catch (error) {
      this.logger.error('Failed to analyze competitors', { error, channelIds });
      throw error;
    }
  }

  /**
   * Kulcsszó elemzés
   */
  async analyzeKeywords(keywords: string[]): Promise<GoogleTrendsData[]> {
    return this.trendsClient.getKeywordTrends(keywords);
  }

  /**
   * Tartalmi rések azonosítása
   */
  async identifyContentGaps(
    competitorChannels: string[],
    category: ContentCategory
  ): Promise<string[]> {
    try {
      const competitors = await this.analyzeCompetitors(competitorChannels);
      const trendingTopics = await this.getTrendingTopics(category);
      
      // Versenytársak által lefedett témák
      const coveredTopics = new Set<string>();
      competitors.forEach(comp => {
        comp.topPerformingVideos.forEach(video => {
          video.tags.forEach(tag => coveredTopics.add(tag.toLowerCase()));
          // Címből témák kinyerése
          const titleTopics = this.extractTopicsFromTitle(video.title);
          titleTopics.forEach(topic => coveredTopics.add(topic));
        });
      });

      // Trending témák, amiket a versenytársak nem fednek le
      const gaps: string[] = [];
      trendingTopics.forEach(video => {
        const videoTopics = this.extractTopicsFromTitle(video.title);
        videoTopics.forEach(topic => {
          if (!coveredTopics.has(topic.toLowerCase())) {
            gaps.push(topic);
          }
        });
      });

      return [...new Set(gaps)];
    } catch (error) {
      this.logger.error('Failed to identify content gaps', { error });
      return [];
    }
  }

  /**
   * Tartalmi ötlet pontozása
   */
  async scoreContentIdea(
    topic: string,
    keywords: string[]
  ): Promise<ContentOpportunity> {
    try {
      // Trend erősség értékelése
      const trendStrength = await this.trendsClient.evaluateTrendStrength(topic);
      
      // YouTube keresési eredmények elemzése
      const searchResults = await this.youtubeClient.searchVideos(topic, {
        order: 'viewCount',
        publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });

      // Verseny szint meghatározása
      const competitionLevel = this.evaluateCompetition(searchResults);
      
      // Becsült nézettség
      const estimatedViews = this.estimateViewPotential(searchResults, trendStrength);
      
      // Monetizációs potenciál
      const monetizationPotential = this.calculateMonetizationPotential(
        estimatedViews,
        topic
      );

      // Célközönség meghatározása
      const audienceDemographics = this.analyzeAudience(searchResults);

      return {
        topic,
        trendScore: trendStrength.score,
        competitionLevel,
        estimatedViews,
        targetKeywords: keywords,
        optimalTiming: this.calculateOptimalTiming(trendStrength),
        contentAngle: this.suggestContentAngle(topic, searchResults),
        audienceDemographics,
        monetizationPotential,
        category: this.categorizeContent(topic)
      };
    } catch (error) {
      this.logger.error('Failed to score content idea', { error, topic });
      throw error;
    }
  }

  /**
   * Trending videók gyűjtése több kategóriából
   */
  private async collectTrendingVideos(
    config: ContentAnalysisConfig
  ): Promise<YouTubeVideoData[]> {
    const allVideos: YouTubeVideoData[] = [];

    for (const category of config.categories) {
      const videos = await this.getTrendingTopics(category, 20);
      allVideos.push(...videos);
    }

    return allVideos;
  }

  /**
   * Feltörekvő témák keresése
   */
  private async findEmergingTopics(
    categories: ContentCategory[]
  ): Promise<string[]> {
    const allTopics: Set<string> = new Set();

    for (const category of categories) {
      const topics = await this.trendsClient.findEmergingTopics(category);
      topics.forEach(topic => allTopics.add(topic));
    }

    return Array.from(allTopics);
  }

  /**
   * Tartalmi lehetőségek azonosítása
   */
  private async identifyOpportunities(
    trendingVideos: YouTubeVideoData[],
    competitors: CompetitorChannel[],
    keywordTrends: GoogleTrendsData[],
    emergingTopics: string[],
    config: ContentAnalysisConfig
  ): Promise<ContentOpportunity[]> {
    const opportunities: ContentOpportunity[] = [];

    // Emerging topics értékelése
    for (const topic of emergingTopics) {
      const opportunity = await this.scoreContentIdea(topic, [topic]);
      
      if (
        opportunity.trendScore >= config.minTrendScore &&
        this.isCompetitionAcceptable(opportunity.competitionLevel, config.maxCompetitionLevel)
      ) {
        opportunities.push(opportunity);
      }
    }

    // Trending videók alapján lehetőségek
    const topicGroups = this.groupVideosByTopic(trendingVideos);
    for (const [topic, videos] of topicGroups.entries()) {
      if (opportunities.some(o => o.topic === topic)) continue;

      const keywords = this.extractKeywordsFromVideos(videos);
      const opportunity = await this.scoreContentIdea(topic, keywords);
      
      if (
        opportunity.trendScore >= config.minTrendScore &&
        this.isCompetitionAcceptable(opportunity.competitionLevel, config.maxCompetitionLevel)
      ) {
        opportunities.push(opportunity);
      }
    }

    // Rendezés pontszám szerint
    return opportunities.sort((a, b) => b.trendScore - a.trendScore).slice(0, 10);
  }

  /**
   * Piaci elemzések generálása
   */
  private generateMarketInsights(
    trendingVideos: YouTubeVideoData[],
    competitors: CompetitorChannel[],
    keywordTrends: GoogleTrendsData[]
  ): MarketInsights {
    // Általános trend meghatározása
    const avgViews = this.calculateAverageViews(trendingVideos);
    const overallTrend = avgViews > 1000000 ? 
      'A piac jelenleg nagyon aktív, magas nézettségi számokkal' :
      'A piac mérsékelt aktivitást mutat';

    // Feltörekvő témák
    const emergingTopics = keywordTrends
      .filter(kt => kt.interest > 50)
      .map(kt => kt.keyword)
      .slice(0, 5);

    // Telítődő témák
    const saturatedTopics = this.identifySaturatedTopics(trendingVideos);

    // Szezonális hatások
    const seasonalFactors = this.identifySeasonalFactors(new Date());

    // Algoritmus változások
    const algorithmChanges = [
      'YouTube Shorts preferálása rövid formátumú tartalmaknál',
      'Hosszabb watch time értékelése a rangsorolásban',
      'Közösségi interakciók fontosságának növekedése'
    ];

    return {
      overallTrend,
      emergingTopics,
      saturatedTopics,
      seasonalFactors,
      algorithmChanges
    };
  }

  /**
   * Javaslatok generálása
   */
  private generateRecommendations(
    opportunities: ContentOpportunity[],
    insights: MarketInsights
  ): string[] {
    const recommendations: string[] = [];

    // Top lehetőségek alapján
    if (opportunities.length > 0) {
      const topOpp = opportunities[0];
      recommendations.push(
        `Fókuszálj a "${topOpp.topic}" témára - ${topOpp.trendScore} pontos trend erősséggel`
      );
    }

    // Verseny alapján
    const lowCompetition = opportunities.filter(o => o.competitionLevel === 'low');
    if (lowCompetition.length > 0) {
      recommendations.push(
        `${lowCompetition.length} alacsony versenyszintű téma azonosítva - gyors belépési lehetőség`
      );
    }

    // Időzítés
    const upcomingOpps = opportunities.filter(o => 
      o.optimalTiming.getTime() > Date.now() &&
      o.optimalTiming.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    if (upcomingOpps.length > 0) {
      recommendations.push(
        `${upcomingOpps.length} téma optimális időzítése a következő héten lesz`
      );
    }

    // Tartalmi formátum
    recommendations.push(
      'Használj hook-okat az első 3 másodpercben a magasabb retention rate-ért',
      'Integráld a trending hangokat és effekteket a nagyobb elérésért',
      'Készíts többplatformos tartalmat (YouTube Shorts, TikTok, Instagram Reels)'
    );

    return recommendations;
  }

  // Segédfüggvények

  private calculateAverageViews(videos: YouTubeVideoData[]): number {
    if (videos.length === 0) return 0;
    const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
    return Math.round(totalViews / videos.length);
  }

  private calculateContentFrequency(videos: YouTubeVideoData[]): number {
    if (videos.length < 2) return 0;

    const sortedVideos = videos.sort((a, b) => 
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    const firstDate = sortedVideos[sortedVideos.length - 1].publishedAt;
    const lastDate = sortedVideos[0].publishedAt;
    const weeksDiff = (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);

    return weeksDiff > 0 ? Math.round(videos.length / weeksDiff) : videos.length;
  }

  private findTopPerformingVideos(
    videos: YouTubeVideoData[],
    limit: number
  ): YouTubeVideoData[] {
    return videos
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  private extractContentPatterns(videos: YouTubeVideoData[]): string[] {
    const patterns = new Set<string>();

    videos.forEach(video => {
      // Cím minták
      if (video.title.includes('Top')) patterns.add('Listák és rangsorok');
      if (video.title.includes('How to')) patterns.add('Oktatási tartalom');
      if (video.title.includes('?')) patterns.add('Kérdés alapú címek');
      
      // Hossz alapú minták
      const duration = this.parseDuration(video.duration);
      if (duration < 60) patterns.add('Shorts formátum');
      else if (duration < 300) patterns.add('Rövid videók (1-5 perc)');
      else if (duration < 600) patterns.add('Közepes videók (5-10 perc)');
      else patterns.add('Hosszú videók (10+ perc)');
    });

    return Array.from(patterns);
  }

  private extractTopicsFromTitle(title: string): string[] {
    // Egyszerű téma kinyerés - valós implementációban NLP-t használnánk
    const words = title.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }

  private evaluateCompetition(videos: YouTubeVideoData[]): CompetitionLevel {
    const avgViews = this.calculateAverageViews(videos);
    
    if (avgViews > 1000000) return 'high';
    if (avgViews > 100000) return 'medium';
    return 'low';
  }

  private estimateViewPotential(
    similarVideos: YouTubeVideoData[],
    trendStrength: any
  ): number {
    const avgViews = this.calculateAverageViews(similarVideos);
    const multiplier = trendStrength.momentum === 'growing' ? 1.5 : 
                      trendStrength.momentum === 'declining' ? 0.7 : 1;
    
    return Math.round(avgViews * multiplier);
  }

  private calculateMonetizationPotential(views: number, topic: string): number {
    // Alapérték nézettség alapján
    let score = Math.min(100, views / 10000);
    
    // Téma alapú módosítók
    const highValueTopics = ['finance', 'business', 'technology', 'education'];
    if (highValueTopics.some(t => topic.toLowerCase().includes(t))) {
      score *= 1.5;
    }
    
    return Math.min(100, Math.round(score));
  }

  private analyzeAudience(videos: YouTubeVideoData[]): AudienceDemographics {
    // Egyszerűsített demográfiai becslés
    // Valós implementációban YouTube Analytics API-t használnánk
    return {
      ageRange: { min: 18, max: 34 },
      gender: { male: 0.6, female: 0.35, other: 0.05 },
      geographicDistribution: {
        'US': 0.4,
        'UK': 0.15,
        'CA': 0.1,
        'AU': 0.1,
        'Other': 0.25
      },
      interests: ['technology', 'entertainment', 'education'],
      deviceUsage: {
        mobile: 0.7,
        desktop: 0.25,
        tablet: 0.05
      }
    };
  }

  private calculateOptimalTiming(trendStrength: any): Date {
    const now = new Date();
    
    if (trendStrength.momentum === 'growing') {
      // Ha növekszik, minél hamarabb
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (trendStrength.momentum === 'declining') {
      // Ha csökken, várjunk a következő ciklusra
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    
    // Stabil esetben a hétvége előtt
    const daysUntilFriday = (5 - now.getDay() + 7) % 7;
    return new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  }

  private suggestContentAngle(topic: string, similarVideos: YouTubeVideoData[]): string {
    // Elemezzük a sikeres videók megközelítését
    const angles = new Map<string, number>();
    
    similarVideos.forEach(video => {
      if (video.title.includes('Beginner')) angles.set('Kezdő barát megközelítés', (angles.get('Kezdő barát megközelítés') || 0) + 1);
      if (video.title.includes('2024') || video.title.includes('2025')) angles.set('Aktualizált, friss tartalom', (angles.get('Aktualizált, friss tartalom') || 0) + 1);
      if (video.title.includes('Secret') || video.title.includes('Hidden')) angles.set('Insider információk', (angles.get('Insider információk') || 0) + 1);
      if (video.title.includes('vs') || video.title.includes('Compare')) angles.set('Összehasonlító elemzés', (angles.get('Összehasonlító elemzés') || 0) + 1);
    });
    
    // Legnépszerűbb megközelítés
    const sortedAngles = Array.from(angles.entries()).sort((a, b) => b[1] - a[1]);
    return sortedAngles.length > 0 ? sortedAngles[0][0] : 'Oktatási és értékteremtő megközelítés';
  }

  private categorizeContent(topic: string): ContentCategory {
    const lowercaseTopic = topic.toLowerCase();
    
    if (lowercaseTopic.includes('money') || lowercaseTopic.includes('invest') || lowercaseTopic.includes('finance')) {
      return 'finance';
    } else if (lowercaseTopic.includes('business') || lowercaseTopic.includes('entrepreneur')) {
      return 'business';
    } else if (lowercaseTopic.includes('motivation') || lowercaseTopic.includes('success')) {
      return 'motivation';
    } else if (lowercaseTopic.includes('top') || lowercaseTopic.includes('best')) {
      return 'top-lists';
    } else if (lowercaseTopic.includes('learn') || lowercaseTopic.includes('tutorial')) {
      return 'education';
    } else if (lowercaseTopic.includes('tech') || lowercaseTopic.includes('ai')) {
      return 'technology';
    } else if (lowercaseTopic.includes('life') || lowercaseTopic.includes('style')) {
      return 'lifestyle';
    }
    
    return 'entertainment';
  }

  private isCompetitionAcceptable(
    level: CompetitionLevel,
    maxLevel: CompetitionLevel
  ): boolean {
    const levels = ['low', 'medium', 'high'];
    return levels.indexOf(level) <= levels.indexOf(maxLevel);
  }

  private groupVideosByTopic(videos: YouTubeVideoData[]): Map<string, YouTubeVideoData[]> {
    const groups = new Map<string, YouTubeVideoData[]>();
    
    videos.forEach(video => {
      const topics = this.extractTopicsFromTitle(video.title);
      topics.forEach(topic => {
        if (!groups.has(topic)) {
          groups.set(topic, []);
        }
        groups.get(topic)!.push(video);
      });
    });
    
    return groups;
  }

  private extractKeywordsFromVideos(videos: YouTubeVideoData[]): string[] {
    const keywordCounts = new Map<string, number>();
    
    videos.forEach(video => {
      // Tags-ekből
      video.tags.forEach(tag => {
        const count = keywordCounts.get(tag) || 0;
        keywordCounts.set(tag, count + 1);
      });
      
      // Címekből
      const titleWords = this.extractTopicsFromTitle(video.title);
      titleWords.forEach(word => {
        const count = keywordCounts.get(word) || 0;
        keywordCounts.set(word, count + 1);
      });
    });
    
    // Top kulcsszavak
    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private identifySaturatedTopics(videos: YouTubeVideoData[]): string[] {
    const topicCounts = new Map<string, number>();
    
    videos.forEach(video => {
      const topics = this.extractTopicsFromTitle(video.title);
      topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });
    
    // Telítődött = sok videó ugyanarról
    return Array.from(topicCounts.entries())
      .filter(([_, count]) => count > videos.length * 0.2)
      .map(([topic]) => topic)
      .slice(0, 5);
  }

  private identifySeasonalFactors(date: Date): string[] {
    const month = date.getMonth();
    const factors: string[] = [];
    
    // Hónap alapú szezonális tényezők
    if (month === 11 || month === 0) factors.push('Újévi fogadalmak és célok');
    if (month >= 2 && month <= 4) factors.push('Tavaszi megújulás témák');
    if (month >= 5 && month <= 7) factors.push('Nyári életmód és utazás');
    if (month >= 8 && month <= 10) factors.push('Vissza az iskolába/munkába');
    if (month === 10 || month === 11) factors.push('Ünnepi szezon és vásárlás');
    
    return factors;
  }

  private parseDuration(duration: string): number {
    // ISO 8601 duration parsing (PT1H30M45S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}