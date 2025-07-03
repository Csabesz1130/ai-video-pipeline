import { EventEmitter } from 'events';
import { BasePlatformTrendMonitor } from './monitors/PlatformTrendMonitor';
import { Platform, Trend } from './types';
import { Logger } from '../../utils/logger';
import { DatabaseService } from '../data/DatabaseService';
import { CacheService } from '../data/CacheService';
import * as cron from 'node-cron';

export interface TrendUpdateEvent {
  platform: Platform;
  trends: Trend[];
  timestamp: Date;
}

export interface EnhancedTrendAggregatorConfig {
  enablePersistence: boolean;
  enableCaching: boolean;
  cacheTTL: number;
  deduplicationWindow: number; // minutes
  cleanupSchedule: string; // cron expression
}

/**
 * Enhanced TrendAggregator with database persistence and Redis caching
 * Provides production-ready trend data management with deduplication,
 * caching, and historical analytics
 */
export class EnhancedTrendAggregator extends EventEmitter {
  private readonly logger = new Logger('EnhancedTrendAggregator');
  private readonly monitors: Set<BasePlatformTrendMonitor> = new Set();
  private latestTrends: Map<Platform, Trend[]> = new Map();
  private lastUpdateTime: Map<Platform, Date> = new Map();
  private seenTrendIds: Set<string> = new Set();
  
  private databaseService?: DatabaseService;
  private cacheService?: CacheService;
  private config: EnhancedTrendAggregatorConfig;
  private cleanupTask?: cron.ScheduledTask;

  constructor(
    config: EnhancedTrendAggregatorConfig,
    databaseService?: DatabaseService,
    cacheService?: CacheService
  ) {
    super();
    this.setMaxListeners(50);
    
    this.config = config;
    this.databaseService = config.enablePersistence ? databaseService : undefined;
    this.cacheService = config.enableCaching ? cacheService : undefined;

    // Set up cleanup task if database is enabled
    if (this.databaseService && config.cleanupSchedule) {
      this.setupCleanupTask();
    }

    this.logger.info('Enhanced TrendAggregator initialized', {
      persistence: !!this.databaseService,
      caching: !!this.cacheService,
      deduplicationWindow: config.deduplicationWindow
    });
  }

  /**
   * Setup automated cleanup task for old data
   */
  private setupCleanupTask(): void {
    this.cleanupTask = cron.schedule(this.config.cleanupSchedule, async () => {
      try {
        this.logger.info('Running scheduled cleanup task');
        await this.performCleanup();
      } catch (error) {
        this.logger.error('Error during scheduled cleanup', { error });
      }
    }, {
      scheduled: false // Don't start immediately
    });
  }

  /**
   * Start the aggregator and cleanup tasks
   */
  public start(): void {
    if (this.cleanupTask) {
      this.cleanupTask.start();
      this.logger.info('Cleanup task scheduled');
    }
  }

  /**
   * Stop the aggregator and cleanup tasks
   */
  public stop(): void {
    if (this.cleanupTask) {
      this.cleanupTask.stop();
      this.logger.info('Cleanup task stopped');
    }
  }

  /**
   * Register a platform monitor to receive its trend updates
   */
  public registerMonitor(monitor: BasePlatformTrendMonitor): void {
    if (this.monitors.has(monitor)) {
      this.logger.warn(`Monitor for ${monitor.getPlatform()} already registered`);
      return;
    }

    this.monitors.add(monitor);
    this.logger.info(`Registered ${monitor.getPlatform()} trend monitor`);

    // Subscribe to trend updates from this monitor
    monitor.on('trends', async (trends: Trend[]) => {
      await this.handleTrendUpdate(monitor.getPlatform(), trends);
    });
  }

  /**
   * Handle incoming trend updates with deduplication and persistence
   */
  private async handleTrendUpdate(platform: Platform, trends: Trend[]): Promise<void> {
    const timestamp = new Date();
    
    try {
      // Deduplicate trends
      const deduplicatedTrends = this.deduplicateTrends(trends);
      this.logger.debug(`Deduplicated ${trends.length} -> ${deduplicatedTrends.length} trends for ${platform}`);

      // Store in memory
      this.latestTrends.set(platform, deduplicatedTrends);
      this.lastUpdateTime.set(platform, timestamp);

      // Persist to database if enabled
      if (this.databaseService && deduplicatedTrends.length > 0) {
        try {
          await this.databaseService.storeTrendsBatch(deduplicatedTrends);
          this.logger.debug(`Persisted ${deduplicatedTrends.length} trends to database`);
        } catch (error) {
          this.logger.error('Failed to persist trends to database', { platform, error });
          // Continue processing even if persistence fails
        }
      }

      // Cache the trends if enabled
      if (this.cacheService && deduplicatedTrends.length > 0) {
        try {
          await this.cacheService.cacheTrends(platform, deduplicatedTrends, this.config.cacheTTL);
          this.logger.debug(`Cached ${deduplicatedTrends.length} trends for ${platform}`);
        } catch (error) {
          this.logger.error('Failed to cache trends', { platform, error });
          // Continue processing even if caching fails
        }
      }

      // Emit events for consumers
      this.emit('trends', { platform, trends: deduplicatedTrends, timestamp });
      this.emit(`trends:${platform}`, { platform, trends: deduplicatedTrends, timestamp });
      
      this.logger.debug(`Processed ${deduplicatedTrends.length} trends from ${platform}`);
    } catch (error) {
      this.logger.error('Error handling trend update', { platform, error });
    }
  }

  /**
   * Deduplicate trends based on ID and time window
   */
  private deduplicateTrends(trends: Trend[]): Trend[] {
    const deduplicatedTrends: Trend[] = [];
    const currentTime = Date.now();
    
    for (const trend of trends) {
      const trendKey = `${trend.id}:${trend.platform}`;
      
      // Check if we've seen this trend recently
      if (!this.seenTrendIds.has(trendKey)) {
        this.seenTrendIds.add(trendKey);
        deduplicatedTrends.push(trend);
        
        // Clean up old trend IDs after deduplication window
        setTimeout(() => {
          this.seenTrendIds.delete(trendKey);
        }, this.config.deduplicationWindow * 60 * 1000);
      }
    }
    
    return deduplicatedTrends;
  }

  /**
   * Get the latest trends for a specific platform with cache fallback
   */
  public async getLatestTrendsByPlatform(platform: Platform): Promise<Trend[] | null> {
    // Try memory first
    const memoryTrends = this.latestTrends.get(platform);
    if (memoryTrends) {
      return memoryTrends;
    }

    // Try cache if enabled
    if (this.cacheService) {
      try {
        const cachedTrends = await this.cacheService.getCachedTrends(platform);
        if (cachedTrends) {
          // Update memory cache
          this.latestTrends.set(platform, cachedTrends);
          this.logger.debug(`Retrieved ${cachedTrends.length} trends from cache for ${platform}`);
          return cachedTrends;
        }
      } catch (error) {
        this.logger.error('Error retrieving cached trends', { platform, error });
      }
    }

    this.logger.debug(`No trends found for ${platform}`);
    return null;
  }

  /**
   * Get the latest trends from all platforms
   */
  public getAllLatestTrends(): Map<Platform, Trend[]> {
    return new Map(this.latestTrends);
  }
  
  /**
   * Get all trends from all platforms as a flat array
   */
  public getAllTrendsFlattened(): Trend[] {
    const allTrends: Trend[] = [];
    this.latestTrends.forEach(platformTrends => {
      allTrends.push(...platformTrends);
    });
    return allTrends;
  }

  /**
   * Get top trends with caching support
   */
  public async getTopTrends(limit: number = 10, metric: keyof Trend['metrics'] = 'currentVolume'): Promise<Trend[]> {
    const cacheKey = `top_trends:${limit}:${metric}`;
    
    // Try cache first if enabled
    if (this.cacheService) {
      try {
        const cachedResult = await this.cacheService.getCachedAggregatedData(cacheKey);
        if (cachedResult) {
          this.logger.debug(`Retrieved top trends from cache`);
          return cachedResult;
        }
      } catch (error) {
        this.logger.error('Error retrieving cached top trends', { error });
      }
    }

    // Calculate top trends
    const allTrends = this.getAllTrendsFlattened();
    const topTrends = allTrends
      .sort((a, b) => {
        const metricA = a.metrics[metric] || 0;
        const metricB = b.metrics[metric] || 0;
        return metricB - metricA;
      })
      .slice(0, limit);

    // Cache result if enabled
    if (this.cacheService && topTrends.length > 0) {
      try {
        await this.cacheService.cacheAggregatedData(cacheKey, topTrends, 300); // 5 minutes TTL
      } catch (error) {
        this.logger.error('Error caching top trends', { error });
      }
    }

    return topTrends;
  }

  /**
   * Search trends with caching support
   */
  public async searchTrends(query: string): Promise<Trend[]> {
    const cacheKey = `search:${query.toLowerCase()}`;
    
    // Try cache first if enabled
    if (this.cacheService) {
      try {
        const cachedResult = await this.cacheService.getCachedAggregatedData(cacheKey);
        if (cachedResult) {
          this.logger.debug(`Retrieved search results from cache for query: ${query}`);
          return cachedResult;
        }
      } catch (error) {
        this.logger.error('Error retrieving cached search results', { query, error });
      }
    }

    // Perform search
    const allTrends = this.getAllTrendsFlattened();
    const normalizedQuery = query.toLowerCase();
    
    const searchResults = allTrends.filter(trend => {
      const name = trend.name.toLowerCase();
      const description = (trend.description || '').toLowerCase();
      const type = trend.type.toLowerCase();
      
      return name.includes(normalizedQuery) || 
             description.includes(normalizedQuery) || 
             type.includes(normalizedQuery);
    });

    // Cache search results if enabled
    if (this.cacheService && searchResults.length > 0) {
      try {
        await this.cacheService.cacheAggregatedData(cacheKey, searchResults, 600); // 10 minutes TTL
      } catch (error) {
        this.logger.error('Error caching search results', { query, error });
      }
    }

    return searchResults;
  }

  /**
   * Get historical trend data from database
   */
  public async getTrendHistory(
    platform?: Platform,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    if (!this.databaseService) {
      this.logger.warn('Database service not available for historical data');
      return [];
    }

    try {
      return await this.databaseService.getTrendHistory(platform, limit, offset);
    } catch (error) {
      this.logger.error('Error retrieving trend history', { platform, error });
      return [];
    }
  }

  /**
   * Perform maintenance cleanup
   */
  public async performCleanup(): Promise<void> {
    if (!this.databaseService) {
      return;
    }

    try {
      const deletedCount = await this.databaseService.cleanupOldSnapshots(30); // Keep 30 days
      this.logger.info(`Cleanup completed: ${deletedCount} old snapshots removed`);
    } catch (error) {
      this.logger.error('Error during cleanup', { error });
    }
  }

  /**
   * Get health status of all components
   */
  public async getHealthStatus(): Promise<{
    memory: { platforms: number; trends: number };
    database?: { connected: boolean; activeConnections: number };
    cache?: { connected: boolean; memory?: string; uptime?: number };
  }> {
    const status: any = {
      memory: {
        platforms: this.latestTrends.size,
        trends: this.getAllTrendsFlattened().length
      }
    };

    // Check database health
    if (this.databaseService) {
      try {
        status.database = await this.databaseService.getHealthStatus();
      } catch (error) {
        this.logger.error('Error checking database health', { error });
        status.database = { connected: false, activeConnections: 0 };
      }
    }

    // Check cache health
    if (this.cacheService) {
      try {
        status.cache = await this.cacheService.getHealthStatus();
      } catch (error) {
        this.logger.error('Error checking cache health', { error });
        status.cache = { connected: false };
      }
    }

    return status;
  }

  /**
   * Unregister a platform monitor
   */
  public unregisterMonitor(monitor: BasePlatformTrendMonitor): void {
    if (!this.monitors.has(monitor)) {
      this.logger.warn(`Monitor for ${monitor.getPlatform()} not registered`);
      return;
    }

    this.monitors.delete(monitor);
    this.logger.info(`Unregistered ${monitor.getPlatform()} trend monitor`);
    
    // Remove stored trends for this platform
    this.latestTrends.delete(monitor.getPlatform());
    this.lastUpdateTime.delete(monitor.getPlatform());
  }

  /**
   * Get the last update time for a specific platform
   */
  public getLastUpdateTime(platform: Platform): Date | null {
    return this.lastUpdateTime.get(platform) || null;
  }
  
  /**
   * Get registered platforms
   */
  public getRegisteredPlatforms(): Platform[] {
    return Array.from(this.monitors).map(monitor => monitor.getPlatform());
  }
}