import { EventEmitter } from 'events';
import { Platform, Trend, TrendMonitoringError, TrendMonitoringErrorType } from '../types';
import { Logger } from '../../../utils/logger';

/**
 * Base abstract class for platform-specific trend monitors
 * All platform implementations should extend this class
 */
export abstract class BasePlatformTrendMonitor extends EventEmitter {
  protected readonly logger: Logger;
  protected readonly platform: Platform;
  private isRunning: boolean = false;
  private pollingIntervalId: NodeJS.Timeout | null = null;

  /**
   * Constructor for the base platform monitor
   * @param platform The social media platform this monitor is responsible for
   */
  constructor(platform: Platform) {
    super();
    this.platform = platform;
    this.logger = new Logger(`${platform.charAt(0).toUpperCase() + platform.slice(1)}TrendMonitor`);
  }

  /**
   * Get the platform this monitor is for
   */
  public getPlatform(): Platform {
    return this.platform;
  }

  /**
   * Start monitoring trends on this platform
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Monitor is already running');
      return;
    }

    this.logger.info(`Starting ${this.platform} trend monitoring`);
    
    try {
      // Initialize platform-specific monitoring
      await this.initializeMonitoring();
      
      // Set up polling interval
      this.isRunning = true;
      const pollingInterval = this.getPollingInterval();
      
      // Perform initial fetch
      await this.pollTrends();
      
      // Set up regular polling
      this.pollingIntervalId = setInterval(async () => {
        try {
          await this.pollTrends();
        } catch (error) {
          this.logger.error(`Error during ${this.platform} trend polling`, { error });
        }
      }, pollingInterval);
      
      this.logger.info(`${this.platform} trend monitoring started successfully (polling every ${pollingInterval/1000}s)`);
    } catch (error) {
      this.isRunning = false;
      this.logger.error(`Failed to start ${this.platform} trend monitoring`, { error });
      
      // Convert to standardized error
      const monitoringError = new TrendMonitoringError(
        `Failed to start ${this.platform} monitoring: ${error.message}`,
        TrendMonitoringErrorType.UNKNOWN_ERROR,
        this.platform,
        error
      );
      
      throw monitoringError;
    }
  }

  /**
   * Stop monitoring trends on this platform
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Monitor is not running');
      return;
    }

    this.logger.info(`Stopping ${this.platform} trend monitoring`);
    
    // Clear polling interval
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    
    try {
      // Perform platform-specific cleanup
      await this.cleanupMonitoring();
      this.logger.info(`${this.platform} trend monitoring stopped successfully`);
    } catch (error) {
      this.logger.error(`Error during ${this.platform} monitoring cleanup`, { error });
      
      // Convert to standardized error
      const monitoringError = new TrendMonitoringError(
        `Failed to cleanly stop ${this.platform} monitoring: ${error.message}`,
        TrendMonitoringErrorType.UNKNOWN_ERROR,
        this.platform,
        error
      );
      
      throw monitoringError;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Check if the monitor is currently running
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Poll for new trends
   */
  private async pollTrends(): Promise<void> {
    try {
      const trends = await this.fetchTrends();
      
      if (trends && trends.length > 0) {
        // Emit trends for consumers
        this.emit('trends', trends);
      }
    } catch (error) {
      // Standardize error reporting
      let errorType = TrendMonitoringErrorType.UNKNOWN_ERROR;
      
      if (error.message?.includes('rate limit')) {
        errorType = TrendMonitoringErrorType.RATE_LIMIT_ERROR;
      } else if (error.message?.includes('authentication') || error.message?.includes('auth')) {
        errorType = TrendMonitoringErrorType.AUTHENTICATION_ERROR;
      } else if (error.message?.includes('timeout')) {
        errorType = TrendMonitoringErrorType.TIMEOUT_ERROR;
      } else if (error.message?.includes('connect') || error.message?.includes('network')) {
        errorType = TrendMonitoringErrorType.CONNECTION_ERROR;
      } else if (error.message?.includes('parse') || error.message?.includes('json')) {
        errorType = TrendMonitoringErrorType.PARSING_ERROR;
      }
      
      // Create standardized error
      const monitoringError = new TrendMonitoringError(
        `Error fetching ${this.platform} trends: ${error.message}`,
        errorType,
        this.platform,
        error
      );
      
      // Emit error for consumers
      this.emit('error', monitoringError);
      
      // Re-throw for internal handling
      throw monitoringError;
    }
  }

  /**
   * Initialize platform-specific monitoring
   * This should be implemented by each platform
   */
  protected abstract initializeMonitoring(): Promise<void>;

  /**
   * Clean up platform-specific monitoring resources
   * This should be implemented by each platform
   */
  protected abstract cleanupMonitoring(): Promise<void>;

  /**
   * Fetch current trends from the platform
   * This should be implemented by each platform
   */
  protected abstract fetchTrends(): Promise<Trend[]>;

  /**
   * Get the polling interval in milliseconds
   * This should be implemented by each platform based on API rate limits
   * and how quickly trends change on that platform
   */
  protected abstract getPollingInterval(): number;
} 