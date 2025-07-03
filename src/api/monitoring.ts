import { Router, Request, Response } from 'express';
import { MonitoringService } from '../services/monitoring/MonitoringService';
import { EnhancedTrendAggregator } from '../services/trend-integration/EnhancedTrendAggregator';
import { Logger } from '../utils/logger';

const logger = new Logger('MonitoringAPI');

export function createMonitoringRouter(
  monitoringService: MonitoringService,
  trendAggregator?: EnhancedTrendAggregator
): Router {
  const router = Router();

  /**
   * Health check endpoint for load balancers
   * Returns 200 if healthy, 503 if unhealthy, 207 if degraded
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const healthResult = await monitoringService.performHealthCheck();
      
      let statusCode = 200;
      if (healthResult.status === 'unhealthy') {
        statusCode = 503; // Service Unavailable
      } else if (healthResult.status === 'degraded') {
        statusCode = 207; // Multi-Status (partial success)
      }

      res.status(statusCode).json({
        status: healthResult.status,
        timestamp: healthResult.timestamp,
        uptime: healthResult.uptime,
        services: healthResult.services
      });
    } catch (error) {
      logger.error('Health check failed', { error });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  });

  /**
   * Simple liveness probe for Kubernetes
   */
  router.get('/health/live', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Readiness probe for Kubernetes
   */
  router.get('/health/ready', async (req: Request, res: Response) => {
    try {
      const healthResult = await monitoringService.performHealthCheck();
      
      if (healthResult.status === 'unhealthy') {
        res.status(503).json({
          status: 'not ready',
          timestamp: healthResult.timestamp,
          reason: 'Service is unhealthy'
        });
      } else {
        res.status(200).json({
          status: 'ready',
          timestamp: healthResult.timestamp
        });
      }
    } catch (error) {
      logger.error('Readiness check failed', { error });
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Readiness check failed'
      });
    }
  });

  /**
   * Prometheus metrics endpoint
   */
  router.get('/metrics', async (req: Request, res: Response) => {
    try {
      const metrics = await monitoringService.getMetrics();
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(metrics);
    } catch (error) {
      logger.error('Failed to get metrics', { error });
      res.status(500).json({
        error: 'Failed to retrieve metrics'
      });
    }
  });

  /**
   * Service status summary endpoint
   */
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const statusSummary = await monitoringService.getStatusSummary();
      res.json(statusSummary);
    } catch (error) {
      logger.error('Failed to get status summary', { error });
      res.status(500).json({
        error: 'Failed to retrieve status summary'
      });
    }
  });

  /**
   * Trend aggregator status (if available)
   */
  router.get('/trends/status', async (req: Request, res: Response) => {
    try {
      if (!trendAggregator) {
        res.status(404).json({
          error: 'Trend aggregator not available'
        });
        return;
      }

      const healthStatus = await trendAggregator.getHealthStatus();
      const platforms = trendAggregator.getRegisteredPlatforms();
      
      const platformStatus: Record<string, any> = {};
      for (const platform of platforms) {
        const lastUpdate = trendAggregator.getLastUpdateTime(platform);
        const trends = await trendAggregator.getLatestTrendsByPlatform(platform);
        
        platformStatus[platform] = {
          lastUpdate: lastUpdate?.toISOString() || null,
          trendCount: trends?.length || 0,
          isStale: lastUpdate ? (Date.now() - lastUpdate.getTime()) > 300000 : true // 5 minutes
        };
      }

      res.json({
        aggregator: healthStatus,
        platforms: platformStatus,
        registeredPlatforms: platforms
      });
    } catch (error) {
      logger.error('Failed to get trend status', { error });
      res.status(500).json({
        error: 'Failed to retrieve trend status'
      });
    }
  });

  /**
   * Database connection info (admin only)
   */
  router.get('/admin/database', async (req: Request, res: Response) => {
    try {
      // In production, you might want to add authentication here
      const healthResult = await monitoringService.performHealthCheck();
      
      if (healthResult.services.database) {
        res.json({
          database: healthResult.services.database,
          timestamp: healthResult.timestamp
        });
      } else {
        res.status(404).json({
          error: 'Database service not configured'
        });
      }
    } catch (error) {
      logger.error('Failed to get database status', { error });
      res.status(500).json({
        error: 'Failed to retrieve database status'
      });
    }
  });

  /**
   * Cache connection info (admin only)
   */
  router.get('/admin/cache', async (req: Request, res: Response) => {
    try {
      // In production, you might want to add authentication here
      const healthResult = await monitoringService.performHealthCheck();
      
      if (healthResult.services.cache) {
        res.json({
          cache: healthResult.services.cache,
          timestamp: healthResult.timestamp
        });
      } else {
        res.status(404).json({
          error: 'Cache service not configured'
        });
      }
    } catch (error) {
      logger.error('Failed to get cache status', { error });
      res.status(500).json({
        error: 'Failed to retrieve cache status'
      });
    }
  });

  /**
   * Memory usage details
   */
  router.get('/admin/memory', (req: Request, res: Response) => {
    try {
      const memUsage = process.memoryUsage();
      const memUsageMB = {
        rss: {
          bytes: memUsage.rss,
          mb: Math.round(memUsage.rss / 1024 / 1024)
        },
        heapTotal: {
          bytes: memUsage.heapTotal,
          mb: Math.round(memUsage.heapTotal / 1024 / 1024)
        },
        heapUsed: {
          bytes: memUsage.heapUsed,
          mb: Math.round(memUsage.heapUsed / 1024 / 1024)
        },
        external: {
          bytes: memUsage.external,
          mb: Math.round(memUsage.external / 1024 / 1024)
        }
      };

      res.json({
        memory: memUsageMB,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      logger.error('Failed to get memory usage', { error });
      res.status(500).json({
        error: 'Failed to retrieve memory usage'
      });
    }
  });

  /**
   * Force garbage collection (development only)
   */
  router.post('/admin/gc', (req: Request, res: Response) => {
    try {
      // Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
          error: 'Garbage collection trigger not allowed in production'
        });
        return;
      }

      // Check if global.gc is available (requires --expose-gc flag)
      if (typeof global.gc === 'function') {
        const beforeMemory = process.memoryUsage();
        global.gc();
        const afterMemory = process.memoryUsage();

        res.json({
          message: 'Garbage collection triggered',
          before: {
            heapUsed: Math.round(beforeMemory.heapUsed / 1024 / 1024),
            heapTotal: Math.round(beforeMemory.heapTotal / 1024 / 1024)
          },
          after: {
            heapUsed: Math.round(afterMemory.heapUsed / 1024 / 1024),
            heapTotal: Math.round(afterMemory.heapTotal / 1024 / 1024)
          },
          freed: Math.round((beforeMemory.heapUsed - afterMemory.heapUsed) / 1024 / 1024)
        });
      } else {
        res.status(503).json({
          error: 'Garbage collection not available. Start with --expose-gc flag'
        });
      }
    } catch (error) {
      logger.error('Failed to trigger garbage collection', { error });
      res.status(500).json({
        error: 'Failed to trigger garbage collection'
      });
    }
  });

  return router;
}