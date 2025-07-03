import Redis from 'ioredis';
import { RedisConfig } from '../../config';
import { Trend, Platform } from '../trend-integration/types';
import { Logger } from '../../utils/logger';

export class CacheService {
  private readonly logger = new Logger('CacheService');
  private redis: Redis;
  private isConnected = false;
  private readonly keyPrefix: string;
  private readonly defaultTTL: number;

  constructor(config: RedisConfig) {
    this.keyPrefix = config.keyPrefix || 'trends:';
    this.defaultTTL = config.ttl || 3600; // 1 hour default

    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Handle Redis events
    this.redis.on('connect', () => {
      this.logger.info('Redis connection established');
      this.isConnected = true;
    });

    this.redis.on('ready', () => {
      this.logger.info('Redis client ready');
    });

    this.redis.on('error', (error: Error) => {
      this.logger.error('Redis connection error', { error: error.message });
      this.isConnected = false;
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    this.redis.on('reconnecting', () => {
      this.logger.info('Redis reconnecting...');
    });
  }

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    try {
      await this.redis.connect();
      this.logger.info('Cache service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize cache service', { error });
      throw error;
    }
  }

  /**
   * Cache trends for a specific platform
   */
  async cacheTrends(platform: Platform, trends: Trend[], ttl?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping cache operation');
      return;
    }

    try {
      const key = `${this.keyPrefix}platform:${platform}`;
      const data = JSON.stringify({
        trends,
        timestamp: new Date().toISOString(),
        count: trends.length
      });
      
      await this.redis.setex(key, ttl || this.defaultTTL, data);
      this.logger.debug(`Cached ${trends.length} trends for ${platform}`);
    } catch (error) {
      this.logger.error('Failed to cache trends', { platform, error });
      // Don't throw - caching failures shouldn't break the application
    }
  }

  /**
   * Get cached trends for a specific platform
   */
  async getCachedTrends(platform: Platform): Promise<Trend[] | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, cannot retrieve cached data');
      return null;
    }

    try {
      const key = `${this.keyPrefix}platform:${platform}`;
      const data = await this.redis.get(key);
      
      if (!data) {
        this.logger.debug(`No cached trends found for ${platform}`);
        return null;
      }

      const parsed = JSON.parse(data);
      this.logger.debug(`Retrieved ${parsed.count} cached trends for ${platform}`);
      return parsed.trends;
    } catch (error) {
      this.logger.error('Failed to retrieve cached trends', { platform, error });
      return null;
    }
  }

  /**
   * Cache aggregated trend data (top trends, search results, etc.)
   */
  async cacheAggregatedData(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping cache operation');
      return;
    }

    try {
      const fullKey = `${this.keyPrefix}aggregated:${key}`;
      const serializedData = JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      });
      
      await this.redis.setex(fullKey, ttl || this.defaultTTL, serializedData);
      this.logger.debug(`Cached aggregated data for key: ${key}`);
    } catch (error) {
      this.logger.error('Failed to cache aggregated data', { key, error });
    }
  }

  /**
   * Get cached aggregated data
   */
  async getCachedAggregatedData(key: string): Promise<any | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, cannot retrieve cached data');
      return null;
    }

    try {
      const fullKey = `${this.keyPrefix}aggregated:${key}`;
      const data = await this.redis.get(fullKey);
      
      if (!data) {
        this.logger.debug(`No cached aggregated data found for key: ${key}`);
        return null;
      }

      const parsed = JSON.parse(data);
      this.logger.debug(`Retrieved cached aggregated data for key: ${key}`);
      return parsed.data;
    } catch (error) {
      this.logger.error('Failed to retrieve cached aggregated data', { key, error });
      return null;
    }
  }

  /**
   * Cache individual trend by ID
   */
  async cacheTrend(trend: Trend, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping cache operation');
      return;
    }

    try {
      const key = `${this.keyPrefix}trend:${trend.id}`;
      const data = JSON.stringify({
        ...trend,
        cached_at: new Date().toISOString()
      });
      
      await this.redis.setex(key, ttl || this.defaultTTL, data);
      this.logger.debug(`Cached individual trend: ${trend.id}`);
    } catch (error) {
      this.logger.error('Failed to cache individual trend', { trendId: trend.id, error });
    }
  }

  /**
   * Get cached individual trend by ID
   */
  async getCachedTrend(trendId: string): Promise<Trend | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, cannot retrieve cached data');
      return null;
    }

    try {
      const key = `${this.keyPrefix}trend:${trendId}`;
      const data = await this.redis.get(key);
      
      if (!data) {
        this.logger.debug(`No cached trend found for ID: ${trendId}`);
        return null;
      }

      const parsed = JSON.parse(data);
      // Remove the cached_at field before returning
      delete parsed.cached_at;
      
      this.logger.debug(`Retrieved cached trend: ${trendId}`);
      return parsed as Trend;
    } catch (error) {
      this.logger.error('Failed to retrieve cached trend', { trendId, error });
      return null;
    }
  }

  /**
   * Invalidate cache for a specific platform
   */
  async invalidatePlatformCache(platform: Platform): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, cannot invalidate cache');
      return;
    }

    try {
      const key = `${this.keyPrefix}platform:${platform}`;
      await this.redis.del(key);
      this.logger.debug(`Invalidated cache for platform: ${platform}`);
    } catch (error) {
      this.logger.error('Failed to invalidate platform cache', { platform, error });
    }
  }

  /**
   * Invalidate all trend-related cache
   */
  async invalidateAllCache(): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, cannot invalidate cache');
      return;
    }

    try {
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.info(`Invalidated ${keys.length} cache entries`);
      } else {
        this.logger.debug('No cache entries to invalidate');
      }
    } catch (error) {
      this.logger.error('Failed to invalidate all cache', { error });
    }
  }

  /**
   * Set cache entry with custom key and TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, skipping cache operation');
      return;
    }

    try {
      const fullKey = `${this.keyPrefix}${key}`;
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(fullKey, ttl, data);
      } else {
        await this.redis.set(fullKey, data);
      }
      
      this.logger.debug(`Set cache entry for key: ${key}`);
    } catch (error) {
      this.logger.error('Failed to set cache entry', { key, error });
    }
  }

  /**
   * Get cache entry by key
   */
  async get(key: string): Promise<any | null> {
    if (!this.isConnected) {
      this.logger.warn('Redis not connected, cannot retrieve cached data');
      return null;
    }

    try {
      const fullKey = `${this.keyPrefix}${key}`;
      const data = await this.redis.get(fullKey);
      
      if (!data) {
        return null;
      }

      try {
        return JSON.parse(data);
      } catch {
        // Return as string if not valid JSON
        return data;
      }
    } catch (error) {
      this.logger.error('Failed to retrieve cache entry', { key, error });
      return null;
    }
  }

  /**
   * Check if cache service is healthy
   */
  async getHealthStatus(): Promise<{ connected: boolean; memory?: string; uptime?: number }> {
    try {
      if (!this.isConnected) {
        return { connected: false };
      }

      await this.redis.ping();
      const info = await this.redis.info('memory');
      const memory = info.split('\n').find(line => line.startsWith('used_memory_human:'))?.split(':')[1]?.trim();
      
      const uptimeInfo = await this.redis.info('server');
      const uptimeSeconds = parseInt(
        uptimeInfo.split('\n').find(line => line.startsWith('uptime_in_seconds:'))?.split(':')[1]?.trim() || '0',
        10
      );

      return {
        connected: true,
        memory,
        uptime: uptimeSeconds
      };
    } catch (error) {
      this.logger.error('Cache health check failed', { error });
      return { connected: false };
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      this.isConnected = false;
      this.logger.info('Redis connection closed');
    } catch (error) {
      this.logger.error('Error closing Redis connection', { error });
      throw error;
    }
  }
}