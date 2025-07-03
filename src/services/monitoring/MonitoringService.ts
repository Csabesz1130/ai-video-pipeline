import { register, collectDefaultMetrics, Counter, Gauge, Histogram } from 'prom-client';
import { Logger } from '../../utils/logger';
import { MonitoringConfig } from '../../config';
import { DatabaseService } from '../data/DatabaseService';
import { CacheService } from '../data/CacheService';
import { Platform } from '../trend-integration/types';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  services: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      details?: any;
    };
  };
}

export class MonitoringService {
  private readonly logger = new Logger('MonitoringService');
  private config: MonitoringConfig;
  
  // Prometheus metrics
  private trendsProcessedCounter: Counter<string>;
  private activeConnectionsGauge: Gauge<string>;
  private cacheHitRateGauge: Gauge<string>;
  private apiResponseTimeHistogram: Histogram<string>;
  private errorCounter: Counter<string>;
  
  private databaseService?: DatabaseService;
  private cacheService?: CacheService;
  private startTime = Date.now();

  constructor(
    config: MonitoringConfig,
    databaseService?: DatabaseService,
    cacheService?: CacheService
  ) {
    this.config = config;
    this.databaseService = databaseService;
    this.cacheService = cacheService;

    // Initialize Prometheus metrics
    this.initializeMetrics();
    
    this.logger.info('Monitoring service initialized', {
      enabled: config.enabled,
      metricsPort: config.metricsPort
    });
  }

  /**
   * Initialize Prometheus metrics
   */
  private initializeMetrics(): void {
    // Collect default Node.js metrics
    collectDefaultMetrics({ register });

    // Custom application metrics
    this.trendsProcessedCounter = new Counter({
      name: 'trends_processed_total',
      help: 'Total number of trends processed by platform',
      labelNames: ['platform', 'status'],
      registers: [register]
    });

    this.activeConnectionsGauge = new Gauge({
      name: 'active_connections_current',
      help: 'Current number of active database connections',
      labelNames: ['service'],
      registers: [register]
    });

    this.cacheHitRateGauge = new Gauge({
      name: 'cache_hit_rate',
      help: 'Cache hit rate percentage',
      labelNames: ['operation'],
      registers: [register]
    });

    this.apiResponseTimeHistogram = new Histogram({
      name: 'api_response_time_seconds',
      help: 'API response time in seconds',
      labelNames: ['endpoint', 'method', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register]
    });

    this.errorCounter = new Counter({
      name: 'errors_total',
      help: 'Total number of errors by type and service',
      labelNames: ['service', 'error_type'],
      registers: [register]
    });

    this.logger.info('Prometheus metrics initialized');
  }

  /**
   * Record trends processed metric
   */
  public recordTrendsProcessed(platform: Platform, count: number, status: 'success' | 'error' = 'success'): void {
    try {
      this.trendsProcessedCounter.inc({ platform, status }, count);
    } catch (error) {
      this.logger.error('Failed to record trends processed metric', { error });
    }
  }

  /**
   * Record API response time
   */
  public recordApiResponseTime(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number
  ): void {
    try {
      this.apiResponseTimeHistogram
        .labels(endpoint, method, statusCode.toString())
        .observe(responseTime / 1000); // Convert to seconds
    } catch (error) {
      this.logger.error('Failed to record API response time', { error });
    }
  }

  /**
   * Record cache hit rate
   */
  public recordCacheHitRate(operation: string, hitRate: number): void {
    try {
      this.cacheHitRateGauge.set({ operation }, hitRate);
    } catch (error) {
      this.logger.error('Failed to record cache hit rate', { error });
    }
  }

  /**
   * Record error occurrence
   */
  public recordError(service: string, errorType: string): void {
    try {
      this.errorCounter.inc({ service, error_type: errorType });
    } catch (error) {
      this.logger.error('Failed to record error metric', { error });
    }
  }

  /**
   * Update connection metrics
   */
  public async updateConnectionMetrics(): Promise<void> {
    try {
      // Database connections
      if (this.databaseService) {
        const dbHealth = await this.databaseService.getHealthStatus();
        this.activeConnectionsGauge.set(
          { service: 'database' },
          dbHealth.activeConnections
        );
      }

      // Redis connection status (simplified to 1 or 0)
      if (this.cacheService) {
        const cacheHealth = await this.cacheService.getHealthStatus();
        this.activeConnectionsGauge.set(
          { service: 'redis' },
          cacheHealth.connected ? 1 : 0
        );
      }
    } catch (error) {
      this.logger.error('Failed to update connection metrics', { error });
    }
  }

  /**
   * Perform comprehensive health check
   */
  public async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    const result: HealthCheckResult = {
      status: 'healthy',
      timestamp,
      uptime,
      services: {}
    };

    // Check database health
    if (this.databaseService) {
      try {
        const dbHealth = await this.databaseService.getHealthStatus();
        result.services.database = {
          status: dbHealth.connected ? 'healthy' : 'unhealthy',
          details: {
            connected: dbHealth.connected,
            activeConnections: dbHealth.activeConnections
          }
        };

        if (!dbHealth.connected) {
          result.status = 'degraded';
        }
      } catch (error) {
        result.services.database = {
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : String(error) }
        };
        result.status = 'degraded';
      }
    }

    // Check cache health
    if (this.cacheService) {
      try {
        const cacheHealth = await this.cacheService.getHealthStatus();
        result.services.cache = {
          status: cacheHealth.connected ? 'healthy' : 'unhealthy',
          details: {
            connected: cacheHealth.connected,
            memory: cacheHealth.memory,
            uptime: cacheHealth.uptime
          }
        };

        if (!cacheHealth.connected) {
          // Cache failures are not critical - mark as degraded not unhealthy
          if (result.status === 'healthy') {
            result.status = 'degraded';
          }
        }
      } catch (error) {
        result.services.cache = {
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : String(error) }
        };
        
        // Cache failures don't make the whole system unhealthy
        if (result.status === 'healthy') {
          result.status = 'degraded';
        }
      }
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    result.services.memory = {
      status: memUsageMB.heapUsed < 512 ? 'healthy' : 'unhealthy', // 512MB threshold
      details: memUsageMB
    };

    if (memUsageMB.heapUsed >= 512) {
      result.status = result.status === 'healthy' ? 'degraded' : result.status;
    }

    if (memUsageMB.heapUsed >= 1024) { // 1GB critical threshold
      result.status = 'unhealthy';
    }

    return result;
  }

  /**
   * Get Prometheus metrics
   */
  public async getMetrics(): Promise<string> {
    try {
      // Update connection metrics before returning
      await this.updateConnectionMetrics();
      return register.metrics();
    } catch (error) {
      this.logger.error('Failed to get metrics', { error });
      throw error;
    }
  }

  /**
   * Start periodic health checks and metric collection
   */
  public startPeriodicChecks(): void {
    if (!this.config.enabled) {
      this.logger.info('Monitoring is disabled');
      return;
    }

    const interval = this.config.healthCheckInterval * 1000; // Convert to milliseconds
    
    setInterval(async () => {
      try {
        const healthResult = await this.performHealthCheck();
        
        // Log health status
        if (healthResult.status !== 'healthy') {
          this.logger.warn('Health check indicates issues', {
            status: healthResult.status,
            services: Object.keys(healthResult.services).filter(
              key => healthResult.services[key].status !== 'healthy'
            )
          });
        } else {
          this.logger.debug('Health check passed');
        }

        // Update connection metrics
        await this.updateConnectionMetrics();
        
      } catch (error) {
        this.logger.error('Error during periodic health check', { error });
        this.recordError('monitoring', 'health_check_failed');
      }
    }, interval);

    this.logger.info(`Started periodic health checks every ${this.config.healthCheckInterval}s`);
  }

  /**
   * Create middleware for Express to automatically track API metrics
   */
  public createExpressMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        const responseTime = Date.now() - startTime;
        
        this.recordApiResponseTime(
          req.route?.path || req.path || 'unknown',
          req.method,
          res.statusCode,
          responseTime
        );

        originalEnd.apply(res, args);
      };

      next();
    };
  }

  /**
   * Record custom application metrics
   */
  public recordCustomMetric(metricName: string, value: number, labels?: Record<string, string>): void {
    try {
      // Create a temporary gauge for custom metrics
      const gauge = new Gauge({
        name: `custom_${metricName}`,
        help: `Custom metric: ${metricName}`,
        labelNames: Object.keys(labels || {}),
        registers: [register]
      });

      if (labels) {
        gauge.set(labels, value);
      } else {
        gauge.set(value);
      }
    } catch (error) {
      this.logger.error('Failed to record custom metric', { metricName, error });
    }
  }

  /**
   * Get service status summary
   */
  public async getStatusSummary(): Promise<{
    overall: string;
    services: { [key: string]: string };
    uptime: number;
  }> {
    const health = await this.performHealthCheck();
    
    return {
      overall: health.status,
      services: Object.fromEntries(
        Object.entries(health.services).map(([key, value]) => [key, value.status])
      ),
      uptime: health.uptime
    };
  }
}