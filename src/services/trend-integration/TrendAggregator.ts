import { EventEmitter } from 'events';
import { BasePlatformTrendMonitor } from './monitors/PlatformTrendMonitor';
import { Platform, Trend } from './types';
import { Logger } from '../../utils/logger';

export interface TrendUpdateEvent {
  platform: Platform;
  trends: Trend[];
  timestamp: Date;
}

/**
 * TrendAggregator collects trends from multiple platforms and provides a unified 
 * interface for trend data access and real-time updates
 */
export class TrendAggregator extends EventEmitter {
  private readonly logger = new Logger('TrendAggregator');
  private readonly monitors: Set<BasePlatformTrendMonitor> = new Set();
  private latestTrends: Map<Platform, Trend[]> = new Map();
  private lastUpdateTime: Map<Platform, Date> = new Map();

  constructor() {
    super();
    this.setMaxListeners(50); // Increase default max listeners
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
    monitor.on('trends', (trends: Trend[]) => {
      const platform = monitor.getPlatform();
      const timestamp = new Date();
      
      // Store the latest trends
      this.latestTrends.set(platform, trends);
      this.lastUpdateTime.set(platform, timestamp);
      
      // Emit the trends for consumers to use
      this.emit('trends', { platform, trends, timestamp });
      this.emit(`trends:${platform}`, { platform, trends, timestamp });
      
      this.logger.debug(`Received ${trends.length} trends from ${platform}`);
    });
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
   * Get the latest trends for a specific platform
   */
  public getLatestTrendsByPlatform(platform: Platform): Trend[] | null {
    return this.latestTrends.get(platform) || null;
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
   * Get the last update time for a specific platform
   */
  public getLastUpdateTime(platform: Platform): Date | null {
    return this.lastUpdateTime.get(platform) || null;
  }
  
  /**
   * Find top trends across all platforms based on metrics
   * @param limit Maximum number of trends to return
   * @param metric The metric to sort by (default: currentVolume)
   */
  public getTopTrends(limit: number = 10, metric: keyof Trend['metrics'] = 'currentVolume'): Trend[] {
    const allTrends = this.getAllTrendsFlattened();
    
    // Sort by the specified metric
    return allTrends
      .sort((a, b) => {
        const metricA = a.metrics[metric] || 0;
        const metricB = b.metrics[metric] || 0;
        return metricB - metricA; // Sort descending
      })
      .slice(0, limit);
  }
  
  /**
   * Search trends across all platforms by name, description, or type
   */
  public searchTrends(query: string): Trend[] {
    const allTrends = this.getAllTrendsFlattened();
    const normalizedQuery = query.toLowerCase();
    
    return allTrends.filter(trend => {
      const name = trend.name.toLowerCase();
      const description = (trend.description || '').toLowerCase();
      const type = trend.type.toLowerCase();
      
      return name.includes(normalizedQuery) || 
             description.includes(normalizedQuery) || 
             type.includes(normalizedQuery);
    });
  }
  
  /**
   * Get registered platforms
   */
  public getRegisteredPlatforms(): Platform[] {
    return Array.from(this.monitors).map(monitor => monitor.getPlatform());
  }
} 