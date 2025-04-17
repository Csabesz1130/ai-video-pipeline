import { Platform, Trend, TrendAnalysis, TrendSchedule } from './types';
import { BasePlatformTrendMonitor } from './monitors/PlatformTrendMonitor';
import { TrendRelevanceAnalyzer } from './analysis/TrendRelevanceAnalyzer';
import { TrendIncorporationEngine } from './incorporation/TrendIncorporationEngine';
import { TrendSchedulingOptimizer } from './scheduling/TrendSchedulingOptimizer';
import { Logger } from '../../utils/logger';

export class RealTimeTrendService {
  private readonly logger: Logger;
  private readonly monitors: Map<Platform, BasePlatformTrendMonitor>;
  private readonly relevanceAnalyzer: TrendRelevanceAnalyzer;
  private readonly incorporationEngine: TrendIncorporationEngine;
  private readonly schedulingOptimizer: TrendSchedulingOptimizer;
  private readonly activeTrends: Map<string, Trend>;

  constructor(
    monitors: BasePlatformTrendMonitor[],
    relevanceAnalyzer: TrendRelevanceAnalyzer,
    incorporationEngine: TrendIncorporationEngine,
    schedulingOptimizer: TrendSchedulingOptimizer
  ) {
    this.logger = new Logger('RealTimeTrendService');
    this.monitors = new Map(monitors.map(monitor => [monitor.platformName, monitor]));
    this.relevanceAnalyzer = relevanceAnalyzer;
    this.incorporationEngine = incorporationEngine;
    this.schedulingOptimizer = schedulingOptimizer;
    this.activeTrends = new Map();
  }

  public async startMonitoring(): Promise<void> {
    try {
      this.logger.info('Starting trend monitoring across all platforms');
      
      for (const monitor of this.monitors.values()) {
        await monitor.startMonitoring();
        monitor.subscribeToTrends(trends => this.handleNewTrends(trends));
      }
    } catch (error) {
      this.logger.error('Failed to start monitoring', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async stopMonitoring(): Promise<void> {
    try {
      this.logger.info('Stopping trend monitoring');
      
      for (const monitor of this.monitors.values()) {
        await monitor.stopMonitoring();
      }
      
      this.activeTrends.clear();
    } catch (error) {
      this.logger.error('Failed to stop monitoring', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async analyzeContentTrends(
    content: string,
    topic: string,
    platforms: Platform[] = Array.from(this.monitors.keys())
  ): Promise<{
    relevantTrends: Trend[];
    analyses: TrendAnalysis[];
    schedules: TrendSchedule[];
  }> {
    try {
      this.logger.info('Analyzing content trends', { topic, platforms });

      const relevantTrends: Trend[] = [];
      const analyses: TrendAnalysis[] = [];
      const schedules: TrendSchedule[] = [];

      for (const platform of platforms) {
        const monitor = this.monitors.get(platform);
        if (!monitor) {
          this.logger.warn('No monitor found for platform', { platform });
          continue;
        }

        const trends = await monitor.getCurrentTrends();
        const filteredTrends = await this.relevanceAnalyzer.filterTrends(trends, topic);

        for (const trend of filteredTrends) {
          const analysis = await this.relevanceAnalyzer.analyzeTrendRelevance(trend, topic);
          const schedule = await this.schedulingOptimizer.findOptimalWindows(trend, content);

          relevantTrends.push(trend);
          analyses.push(analysis);
          schedules.push(schedule);

          // Start monitoring trend evolution
          await this.schedulingOptimizer.monitorTrendEvolution(trend);
        }
      }

      return { relevantTrends, analyses, schedules };
    } catch (error) {
      this.logger.error('Failed to analyze content trends', {
        error: error instanceof Error ? error.message : 'Unknown error',
        topic,
        platforms
      });
      throw error;
    }
  }

  public async incorporateTrends(
    content: string,
    trends: Trend[]
  ): Promise<{
    modifiedContent: string;
    visualElements: string[];
    sounds: string[];
    hashtags: string[];
  }> {
    try {
      this.logger.info('Incorporating trends into content', {
        trendCount: trends.length
      });

      let modifiedContent = content;
      const allVisualElements: string[] = [];
      const allSounds: string[] = [];
      const allHashtags: string[] = [];

      for (const trend of trends) {
        // Generate script modifications
        modifiedContent = await this.incorporationEngine.generateScriptModifications(
          modifiedContent,
          trend
        );

        // Create visual elements
        const visualElements = await this.incorporationEngine.createVisualElements(
          trend,
          modifiedContent
        );
        allVisualElements.push(...visualElements);

        // Suggest sounds
        const sounds = await this.incorporationEngine.suggestSounds(
          trend,
          modifiedContent
        );
        allSounds.push(...sounds);

        // Recommend hashtags
        const hashtags = await this.incorporationEngine.recommendHashtags(
          trend,
          modifiedContent
        );
        allHashtags.push(...hashtags);
      }

      return {
        modifiedContent,
        visualElements: [...new Set(allVisualElements)],
        sounds: [...new Set(allSounds)],
        hashtags: [...new Set(allHashtags)]
      };
    } catch (error) {
      this.logger.error('Failed to incorporate trends', {
        error: error instanceof Error ? error.message : 'Unknown error',
        trendCount: trends.length
      });
      throw error;
    }
  }

  private async handleNewTrends(trends: Trend[]): Promise<void> {
    try {
      for (const trend of trends) {
        if (!this.activeTrends.has(trend.id)) {
          this.logger.info('New trend detected', { trend: trend.name });
          this.activeTrends.set(trend.id, trend);
          
          // Start monitoring trend evolution
          await this.schedulingOptimizer.monitorTrendEvolution(trend);
        }
      }
    } catch (error) {
      this.logger.error('Error handling new trends', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 