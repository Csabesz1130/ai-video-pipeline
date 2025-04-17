import { Platform, Trend } from '../types';
import { BasePlatformTrendMonitor } from './PlatformTrendMonitor';
import { Logger } from '../../../utils/logger';
import { retryWithBackoff } from '../../../utils/retry';

export class TwitterTrendMonitor extends BasePlatformTrendMonitor {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly bearerToken: string;
  
  // Optional rate limit tracking for Twitter API v2
  private rateLimitRemaining: number = 0;
  private rateLimitReset: number = 0;

  constructor(apiKey: string, apiSecret: string, bearerToken: string) {
    super('twitter');
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.bearerToken = bearerToken;
  }

  protected async initializeMonitoring(): Promise<void> {
    this.logger.info('Initializing Twitter trend monitoring');
    try {
      // In production:
      // 1. Validate API credentials
      // 2. Set up Twitter API v2 client
      // 3. Initialize any stream connections or filtered track endpoints
      
      // this.twitterClient = new TwitterApi(this.bearerToken);
      // this.validateApiCredentials();
    } catch (error) {
      this.logger.error('Failed to initialize Twitter monitoring', { error });
      throw error;
    }
  }

  protected async cleanupMonitoring(): Promise<void> {
    this.logger.info('Cleaning up Twitter trend monitoring');
    try {
      // Close any active connections or streams
      // Example: await this.twitterClient.disconnectStreams();
    } catch (error) {
      this.logger.error('Error during Twitter monitoring cleanup', { error });
      // Continue cleanup despite errors
    }
  }

  protected async fetchTrends(): Promise<Trend[]> {
    return retryWithBackoff(async () => {
      this.logger.info('Fetching Twitter trends');
      
      try {
        // Check if we're rate limited before making the request
        if (this.shouldRespectRateLimit()) {
          const waitTimeMs = (this.rateLimitReset * 1000) - Date.now() + 1000; // Add 1s buffer
          this.logger.warn(`Twitter rate limit reached. Waiting ${waitTimeMs}ms before retrying`);
          await new Promise(resolve => setTimeout(resolve, waitTimeMs));
        }
        
        // In production implementation:
        // 1. Call Twitter API v2 endpoints for trending topics
        //    - GET /2/trends/place for location-based trends
        //    - GET /2/tweets/search/recent for hashtag volume data
        // 2. Process the response and update rate limit information
        // 3. Transform to standardized trend format
        
        // Example:
        // const response = await this.twitterClient.v2.trendingTopics();
        // this.updateRateLimits(response.headers);
        // return this.transformTwitterTrends(response.data);
        
        // For now, return realistic mock data
        return [
          {
            id: 'twitter-trend-1',
            platform: 'twitter',
            type: 'hashtag',
            name: '#AI',
            description: 'Artificial intelligence and machine learning discussions',
            metrics: {
              currentVolume: 1800000,
              growthRate: 0.75,
              engagementRate: 0.68,
              sentiment: 0.6
            },
            metadata: {
              startTime: new Date(),
              relatedTrends: ['#MachineLearning', '#DeepLearning'],
              category: 'Technology',
              language: 'en',
              region: 'Global'
            }
          },
          {
            id: 'twitter-trend-2',
            platform: 'twitter',
            type: 'topic',
            name: 'Climate Change',
            description: 'Discussions about environmental impacts and policies',
            metrics: {
              currentVolume: 1200000,
              growthRate: 0.62,
              engagementRate: 0.78,
              sentiment: 0.4
            },
            metadata: {
              startTime: new Date(),
              relatedTrends: ['#ClimateAction', '#Sustainability'],
              category: 'Science & Environment',
              language: 'en',
              region: 'Global'
            }
          },
          {
            id: 'twitter-trend-3',
            platform: 'twitter',
            type: 'hashtag',
            name: '#ThreadsApp',
            description: 'Twitter alternative discussion',
            metrics: {
              currentVolume: 950000,
              growthRate: 0.9,
              engagementRate: 0.85,
              sentiment: 0.65
            },
            metadata: {
              startTime: new Date(),
              relatedTrends: ['#SocialMedia', '#TwitterMigration'],
              category: 'Technology',
              language: 'en',
              region: 'US'
            }
          }
        ];
      } catch (error) {
        // Handle Twitter-specific error codes
        if (this.isRateLimitError(error)) {
          this.handleRateLimitError(error);
          throw new Error('Twitter API rate limit exceeded');
        }
        
        this.logger.error('Error fetching Twitter trends', { error });
        throw error;
      }
    }, {
      maxRetries: 5,
      initialDelayMs: 2000,
      backoffFactor: 2,
      maxDelayMs: 60000,
      shouldRetry: (error) => !this.isRateLimitError(error) // Don't retry rate limit errors
    });
  }

  protected getPollingInterval(): number {
    // Twitter trends update rapidly, especially during global events
    return 3 * 60 * 1000; // 3 minutes
  }
  
  // Helper methods for production readiness
  
  private shouldRespectRateLimit(): boolean {
    return this.rateLimitRemaining <= 5 && this.rateLimitReset > Date.now() / 1000;
  }
  
  private isRateLimitError(error: any): boolean {
    return error?.status === 429 || 
           error?.code === 88 || 
           (error?.message && error.message.includes('rate limit'));
  }
  
  private handleRateLimitError(error: any): void {
    // Extract reset time from headers or error response
    try {
      const resetTime = error?.headers?.['x-rate-limit-reset'] || 
                      error?.rateLimit?.reset ||
                      Math.floor(Date.now() / 1000) + 900; // Default 15min wait
      
      this.rateLimitRemaining = 0;
      this.rateLimitReset = parseInt(resetTime, 10);
      
      this.logger.warn('Twitter rate limit exceeded', {
        resetTime: new Date(this.rateLimitReset * 1000).toISOString(),
        waitTimeSeconds: this.rateLimitReset - Math.floor(Date.now() / 1000)
      });
    } catch (parseError) {
      this.logger.error('Failed to parse rate limit data', { error: parseError });
      // Conservative default
      this.rateLimitReset = Math.floor(Date.now() / 1000) + 900; // 15 minutes
    }
  }
  
  private updateRateLimits(headers: any): void {
    try {
      if (headers['x-rate-limit-remaining']) {
        this.rateLimitRemaining = parseInt(headers['x-rate-limit-remaining'], 10);
      }
      
      if (headers['x-rate-limit-reset']) {
        this.rateLimitReset = parseInt(headers['x-rate-limit-reset'], 10);
      }
      
      // Log if we're getting close to the limit
      if (this.rateLimitRemaining < 10) {
        this.logger.warn('Twitter API rate limit running low', {
          remaining: this.rateLimitRemaining,
          resetTime: new Date(this.rateLimitReset * 1000).toISOString()
        });
      }
    } catch (error) {
      this.logger.error('Error updating rate limit data', { error });
    }
  }
} 