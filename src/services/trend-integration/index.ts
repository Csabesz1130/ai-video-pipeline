import { TikTokTrendMonitor } from './monitors/TikTokTrendMonitor';
import { YouTubeTrendMonitor } from './monitors/YouTubeTrendMonitor';
import { InstagramTrendMonitor } from './monitors/InstagramTrendMonitor';
import { TwitterTrendMonitor } from './monitors/TwitterTrendMonitor';
import { TrendAggregator } from './TrendAggregator';
import { Logger } from '../../utils/logger';
import { Config } from '../../config';

export interface TrendMonitoringService {
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  getAggregator(): TrendAggregator;
}

export class TrendMonitoringServiceImpl implements TrendMonitoringService {
  private readonly logger = new Logger('TrendMonitoringService');
  private readonly aggregator: TrendAggregator;
  private readonly monitors: Array<
    TikTokTrendMonitor | 
    YouTubeTrendMonitor | 
    InstagramTrendMonitor | 
    TwitterTrendMonitor
  > = [];
  
  constructor(config: Config) {
    this.aggregator = new TrendAggregator();
    
    // Initialize each platform monitor if configured
    if (config.tiktok?.apiKey && config.tiktok?.apiSecret) {
      this.logger.info('Initializing TikTok trend monitor');
      const tiktokMonitor = new TikTokTrendMonitor(
        config.tiktok.apiKey,
        config.tiktok.apiSecret
      );
      this.monitors.push(tiktokMonitor);
      this.aggregator.registerMonitor(tiktokMonitor);
    }
    
    if (config.youtube?.apiKey && config.youtube?.clientId && config.youtube?.clientSecret) {
      this.logger.info('Initializing YouTube trend monitor');
      const youtubeMonitor = new YouTubeTrendMonitor(
        config.youtube.apiKey,
        config.youtube.clientId,
        config.youtube.clientSecret
      );
      this.monitors.push(youtubeMonitor);
      this.aggregator.registerMonitor(youtubeMonitor);
    }
    
    if (config.instagram?.accessToken && config.instagram?.appId && config.instagram?.appSecret) {
      this.logger.info('Initializing Instagram trend monitor');
      const instagramMonitor = new InstagramTrendMonitor(
        config.instagram.accessToken,
        config.instagram.appId,
        config.instagram.appSecret
      );
      this.monitors.push(instagramMonitor);
      this.aggregator.registerMonitor(instagramMonitor);
    }
    
    if (config.twitter?.apiKey && config.twitter?.apiSecret && config.twitter?.bearerToken) {
      this.logger.info('Initializing Twitter trend monitor');
      const twitterMonitor = new TwitterTrendMonitor(
        config.twitter.apiKey,
        config.twitter.apiSecret,
        config.twitter.bearerToken
      );
      this.monitors.push(twitterMonitor);
      this.aggregator.registerMonitor(twitterMonitor);
    }
    
    if (this.monitors.length === 0) {
      this.logger.warn('No trend monitors were configured. Check your environment variables or configuration.');
    } else {
      this.logger.info(`Initialized ${this.monitors.length} trend monitors`);
    }
  }
  
  public async startMonitoring(): Promise<void> {
    this.logger.info('Starting trend monitoring service');
    
    if (this.monitors.length === 0) {
      this.logger.warn('No trend monitors configured, monitoring will not start');
      return;
    }
    
    const startPromises = this.monitors.map(monitor => 
      monitor.start().catch(error => {
        this.logger.error(`Failed to start ${monitor.getPlatform()} monitor`, { error });
        // Don't let one monitor failure stop the others
        return Promise.resolve();
      })
    );
    
    await Promise.all(startPromises);
    this.logger.info('All trend monitors started successfully');
  }
  
  public async stopMonitoring(): Promise<void> {
    this.logger.info('Stopping trend monitoring service');
    
    const stopPromises = this.monitors.map(monitor => 
      monitor.stop().catch(error => {
        this.logger.error(`Failed to cleanly stop ${monitor.getPlatform()} monitor`, { error });
        // Still continue stopping the rest
        return Promise.resolve();
      })
    );
    
    await Promise.all(stopPromises);
    this.logger.info('All trend monitors stopped');
  }
  
  public getAggregator(): TrendAggregator {
    return this.aggregator;
  }
}

// Convenience export
export { TrendAggregator } from './TrendAggregator';
export * from './types';
export { TikTokTrendMonitor } from './monitors/TikTokTrendMonitor';
export { YouTubeTrendMonitor } from './monitors/YouTubeTrendMonitor';
export { InstagramTrendMonitor } from './monitors/InstagramTrendMonitor';
export { TwitterTrendMonitor } from './monitors/TwitterTrendMonitor'; 