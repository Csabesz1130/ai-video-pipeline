import dotenv from 'dotenv';
import express from 'express';
import { startApiServer } from './api/server';
import { initializeServices } from './config/services';
import { TrendMonitoringServiceImpl } from './services/trend-integration';
import config from './config';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Main');

async function main() {
  logger.info('Starting application', {
    environment: config.environment,
    port: config.port
  });

  // Initialize services
  await initializeServices();
  
  // Start API server
  const app = express();
  startApiServer(app);
  
  // Initialize trend monitoring service
  if (config.trendPollingEnabled) {
    const trendMonitoringService = new TrendMonitoringServiceImpl(config);
    
    // Register cleanup on exit
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down...');
      await trendMonitoringService.stopMonitoring();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down...');
      await trendMonitoringService.stopMonitoring();
      process.exit(0);
    });
    
    // Start monitoring
    try {
      await trendMonitoringService.startMonitoring();
      
      // Get the trend aggregator for other services to use
      const trendAggregator = trendMonitoringService.getAggregator();
      
      // Example of subscribing to trend updates
      trendAggregator.on('trends', ({ platform, trends, timestamp }) => {
        logger.info(`Received ${trends.length} trends from ${platform}`, {
          timestamp: timestamp.toISOString()
        });
        
        // Get the top 3 trends by volume
        const topTrends = trendAggregator.getTopTrends(3);
        logger.info('Top 3 trends across all platforms:', {
          trends: topTrends.map(t => ({ name: t.name, platform: t.platform, volume: t.metrics.currentVolume }))
        });
      });
      
      logger.info('Trend monitoring service started successfully');
    } catch (error) {
      logger.error('Failed to start trend monitoring service', { error });
      process.exit(1);
    }
  } else {
    logger.info('Trend polling is disabled by configuration');
  }
  
  // Here you could initialize and start other services
  // such as a web server, API endpoints, etc.
  
  logger.info('Application started successfully');
}

// Execute main function
main().catch(error => {
  logger.error('Unhandled error in main process', { error });
  process.exit(1);
});
