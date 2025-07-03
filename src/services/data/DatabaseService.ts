import { Pool, PoolClient, QueryResult } from 'pg';
import { DatabaseConfig } from '../../config';
import { Trend, Platform } from '../trend-integration/types';
import { Logger } from '../../utils/logger';

export interface TrendHistory {
  id: string;
  platform: Platform;
  name: string;
  type: string;
  first_seen: Date;
  last_seen: Date;
  peak_volume: number;
  current_volume: number;
  growth_rate: number;
  engagement_rate: number;
  sentiment: number;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export interface TrendSnapshot {
  id: string;
  trend_id: string;
  platform: Platform;
  volume: number;
  growth_rate: number;
  engagement_rate: number;
  sentiment: number;
  captured_at: Date;
}

export class DatabaseService {
  private readonly logger = new Logger('DatabaseService');
  private pool: Pool;
  private isConnected = false;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: config.maxConnections || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      this.logger.error('Database pool error', { error: err });
      this.isConnected = false;
    });

    this.pool.on('connect', () => {
      if (!this.isConnected) {
        this.logger.info('Database connection established');
        this.isConnected = true;
      }
    });
  }

  /**
   * Initialize database connection and create tables if they don't exist
   */
  async initialize(): Promise<void> {
    try {
      await this.createTables();
      this.isConnected = true;
      this.logger.info('Database service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database service', { error });
      throw error;
    }
  }

  /**
   * Create database tables for trend storage
   */
  private async createTables(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Create trends table for historical data
      await client.query(`
        CREATE TABLE IF NOT EXISTS trends (
          id VARCHAR(255) PRIMARY KEY,
          platform VARCHAR(50) NOT NULL,
          name VARCHAR(500) NOT NULL,
          type VARCHAR(100) NOT NULL,
          description TEXT,
          first_seen TIMESTAMP WITH TIME ZONE NOT NULL,
          last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
          peak_volume BIGINT DEFAULT 0,
          current_volume BIGINT DEFAULT 0,
          growth_rate DECIMAL(10,4) DEFAULT 0,
          engagement_rate DECIMAL(10,4) DEFAULT 0,
          sentiment DECIMAL(10,4) DEFAULT 0,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create trend_snapshots table for time-series data
      await client.query(`
        CREATE TABLE IF NOT EXISTS trend_snapshots (
          id SERIAL PRIMARY KEY,
          trend_id VARCHAR(255) NOT NULL,
          platform VARCHAR(50) NOT NULL,
          volume BIGINT NOT NULL,
          growth_rate DECIMAL(10,4) NOT NULL,
          engagement_rate DECIMAL(10,4) NOT NULL,
          sentiment DECIMAL(10,4) NOT NULL,
          captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (trend_id) REFERENCES trends(id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better query performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_trends_platform ON trends(platform);
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_trends_name ON trends(name);
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_trends_type ON trends(type);
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_trends_last_seen ON trends(last_seen);
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_trend_snapshots_trend_id ON trend_snapshots(trend_id);
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_trend_snapshots_captured_at ON trend_snapshots(captured_at);
      `);

      this.logger.info('Database tables created/verified successfully');
    } finally {
      client.release();
    }
  }

  /**
   * Store or update a trend in the database
   */
  async storeTrend(trend: Trend): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if trend already exists
      const existingTrend = await client.query(
        'SELECT id, peak_volume FROM trends WHERE id = $1',
        [trend.id]
      );

      const now = new Date();
      
      if (existingTrend.rows.length > 0) {
        // Update existing trend
        const currentPeak = existingTrend.rows[0].peak_volume;
        const newPeak = Math.max(currentPeak, trend.metrics.currentVolume);
        
        await client.query(`
          UPDATE trends SET
            last_seen = $1,
            current_volume = $2,
            peak_volume = $3,
            growth_rate = $4,
            engagement_rate = $5,
            sentiment = $6,
            metadata = $7,
            updated_at = $1
          WHERE id = $8
        `, [
          now,
          trend.metrics.currentVolume,
          newPeak,
          trend.metrics.growthRate,
          trend.metrics.engagementRate,
          trend.metrics.sentiment,
          JSON.stringify(trend.metadata),
          trend.id
        ]);
      } else {
        // Insert new trend
        await client.query(`
          INSERT INTO trends (
            id, platform, name, type, description, first_seen, last_seen,
            peak_volume, current_volume, growth_rate, engagement_rate,
            sentiment, metadata, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $7, $8, $9, $10, $11, $6, $6)
        `, [
          trend.id,
          trend.platform,
          trend.name,
          trend.type,
          trend.description || '',
          now,
          trend.metrics.currentVolume,
          trend.metrics.growthRate,
          trend.metrics.engagementRate,
          trend.metrics.sentiment,
          JSON.stringify(trend.metadata)
        ]);
      }

      // Always insert a snapshot for time-series analysis
      await client.query(`
        INSERT INTO trend_snapshots (
          trend_id, platform, volume, growth_rate, engagement_rate, sentiment, captured_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        trend.id,
        trend.platform,
        trend.metrics.currentVolume,
        trend.metrics.growthRate,
        trend.metrics.engagementRate,
        trend.metrics.sentiment,
        now
      ]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to store trend', { trendId: trend.id, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Store multiple trends in a batch operation
   */
  async storeTrendsBatch(trends: Trend[]): Promise<void> {
    if (trends.length === 0) return;

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const trend of trends) {
        await this.storeTrendWithClient(client, trend);
      }

      await client.query('COMMIT');
      this.logger.debug(`Stored ${trends.length} trends in batch`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to store trends batch', { count: trends.length, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helper method to store trend with existing client (for batch operations)
   */
  private async storeTrendWithClient(client: PoolClient, trend: Trend): Promise<void> {
    const existingTrend = await client.query(
      'SELECT id, peak_volume FROM trends WHERE id = $1',
      [trend.id]
    );

    const now = new Date();
    
    if (existingTrend.rows.length > 0) {
      const currentPeak = existingTrend.rows[0].peak_volume;
      const newPeak = Math.max(currentPeak, trend.metrics.currentVolume);
      
      await client.query(`
        UPDATE trends SET
          last_seen = $1, current_volume = $2, peak_volume = $3,
          growth_rate = $4, engagement_rate = $5, sentiment = $6,
          metadata = $7, updated_at = $1
        WHERE id = $8
      `, [
        now, trend.metrics.currentVolume, newPeak,
        trend.metrics.growthRate, trend.metrics.engagementRate,
        trend.metrics.sentiment, JSON.stringify(trend.metadata), trend.id
      ]);
    } else {
      await client.query(`
        INSERT INTO trends (
          id, platform, name, type, description, first_seen, last_seen,
          peak_volume, current_volume, growth_rate, engagement_rate,
          sentiment, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $7, $8, $9, $10, $11)
      `, [
        trend.id, trend.platform, trend.name, trend.type,
        trend.description || '', now, trend.metrics.currentVolume,
        trend.metrics.growthRate, trend.metrics.engagementRate,
        trend.metrics.sentiment, JSON.stringify(trend.metadata)
      ]);
    }

    await client.query(`
      INSERT INTO trend_snapshots (
        trend_id, platform, volume, growth_rate, engagement_rate, sentiment
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      trend.id, trend.platform, trend.metrics.currentVolume,
      trend.metrics.growthRate, trend.metrics.engagementRate, trend.metrics.sentiment
    ]);
  }

  /**
   * Get trending data for analytics
   */
  async getTrendHistory(
    platform?: Platform,
    limit: number = 100,
    offset: number = 0
  ): Promise<TrendHistory[]> {
    const client = await this.pool.connect();
    
    try {
      let query = `
        SELECT * FROM trends 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (platform) {
        query += ` AND platform = $${paramIndex}`;
        params.push(platform);
        paramIndex++;
      }

      query += ` ORDER BY last_seen DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Clean up old trend snapshots (for maintenance)
   */
  async cleanupOldSnapshots(daysToKeep: number = 30): Promise<number> {
    const client = await this.pool.connect();
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await client.query(
        'DELETE FROM trend_snapshots WHERE captured_at < $1',
        [cutoffDate]
      );

      const deletedCount = result.rowCount || 0;
      this.logger.info(`Cleaned up ${deletedCount} old trend snapshots`);
      return deletedCount;
    } finally {
      client.release();
    }
  }

  /**
   * Get health status of the database
   */
  async getHealthStatus(): Promise<{ connected: boolean; activeConnections: number }> {
    try {
      const result = await this.pool.query('SELECT 1');
      return {
        connected: true,
        activeConnections: this.pool.totalCount
      };
    } catch (error) {
      this.logger.error('Database health check failed', { error });
      return {
        connected: false,
        activeConnections: 0
      };
    }
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      this.logger.info('Database connections closed');
    } catch (error) {
      this.logger.error('Error closing database connections', { error });
      throw error;
    }
  }
}