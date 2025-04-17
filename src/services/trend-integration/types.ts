/**
 * Supported social media platforms
 */
export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'twitter';

/**
 * Type of trend 
 */
export type TrendType = 
  // Common across platforms
  | 'hashtag'
  | 'topic'
  | 'challenge'
  
  // Platform-specific
  | 'sound'        // TikTok specific
  | 'filter'       // Instagram specific
  | 'effect'       // TikTok/Instagram specific
  | 'creator'      // Any platform
  | 'video'        // Any platform
  | 'music'        // Any platform
  | 'meme'         // Any platform
  | 'event';       // Any platform

/**
 * Metrics for a trend
 */
export interface TrendMetrics {
  /**
   * Current volume of content/posts for this trend
   */
  currentVolume: number;
  
  /**
   * Growth rate as a decimal (e.g., 0.5 = 50% growth)
   */
  growthRate: number;
  
  /**
   * Engagement rate as a decimal (likes, comments, shares relative to views)
   */
  engagementRate: number;
  
  /**
   * Sentiment score from -1 (negative) to 1 (positive)
   */
  sentiment: number;
}

/**
 * Additional metadata for a trend
 */
export interface TrendMetadata {
  /**
   * When the trend started
   */
  startTime: Date;
  
  /**
   * Related trends (often hashtags)
   */
  relatedTrends?: string[];
  
  /**
   * Content category
   */
  category?: string;
  
  /**
   * Primary language of the trend
   */
  language?: string;
  
  /**
   * Geographic region where the trend is most popular
   */
  region?: string;
  
  /**
   * Any additional platform-specific data
   */
  [key: string]: any;
}

/**
 * Represents a trending topic across any platform
 */
export interface Trend {
  /**
   * Unique identifier for the trend
   */
  id: string;
  
  /**
   * Platform where the trend is observed
   */
  platform: Platform;
  
  /**
   * Type of trend
   */
  type: TrendType;
  
  /**
   * Name or title of the trend (e.g., hashtag name, challenge name)
   */
  name: string;
  
  /**
   * Description of what the trend is about
   */
  description?: string;
  
  /**
   * Quantitative metrics about the trend
   */
  metrics: TrendMetrics;
  
  /**
   * Additional contextual information
   */
  metadata: TrendMetadata;
}

/**
 * Configuration for platform API authentication
 */
export interface PlatformAPIConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  bearerToken?: string;
}

/**
 * Error types for trend monitoring
 */
export enum TrendMonitoringErrorType {
  AUTHENTICATION_ERROR = 'authentication_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  CONNECTION_ERROR = 'connection_error',
  API_ERROR = 'api_error',
  PARSING_ERROR = 'parsing_error',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Error class for trend monitoring issues
 */
export class TrendMonitoringError extends Error {
  public readonly type: TrendMonitoringErrorType;
  public readonly platform: Platform;
  public readonly originalError?: any;
  
  constructor(
    message: string, 
    type: TrendMonitoringErrorType, 
    platform: Platform, 
    originalError?: any
  ) {
    super(message);
    this.name = 'TrendMonitoringError';
    this.type = type;
    this.platform = platform;
    this.originalError = originalError;
  }
}

export interface TrendAnalysis {
  relevanceScore: number;
  longevityScore: number;
  growthPotential: number;
  riskScore: number;
  integrationPoints: {
    timestamp: number;
    confidence: number;
    suggestedModifications: string[];
  }[];
  recommendations: {
    scriptModifications: string[];
    visualElements: string[];
    sounds: string[];
    hashtags: string[];
  };
}

export interface TrendSchedule {
  optimalWindows: {
    startTime: Date;
    endTime: Date;
    confidence: number;
    expectedImpact: number;
  }[];
  updatePoints: {
    timestamp: Date;
    type: 'minor' | 'major';
    suggestedChanges: string[];
  }[];
  monitoringFrequency: number;
}

export interface PlatformTrendMonitor {
  platform: Platform;
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  getCurrentTrends(): Promise<Trend[]>;
  subscribeToTrends(callback: (trends: Trend[]) => void): void;
  unsubscribeFromTrends(callback: (trends: Trend[]) => void): void;
}

export interface TrendRelevanceAnalyzer {
  analyzeTrendRelevance(trend: Trend, contentTopic: string): Promise<TrendAnalysis>;
  predictTrendLongevity(trend: Trend): Promise<number>;
  identifyIntegrationPoints(trend: Trend, content: string): Promise<number[]>;
  filterTrends(trends: Trend[], contentTopic: string): Promise<Trend[]>;
}

export interface TrendIncorporationEngine {
  generateScriptModifications(script: string, trend: Trend): Promise<string>;
  createVisualElements(trend: Trend, content: string): Promise<string[]>;
  suggestSounds(trend: Trend, content: string): Promise<string[]>;
  recommendHashtags(trend: Trend, content: string): Promise<string[]>;
}

export interface TrendSchedulingOptimizer {
  findOptimalWindows(trend: Trend, content: string): Promise<TrendSchedule>;
  predictTrendCycles(trend: Trend): Promise<Date[]>;
  createPublicationSchedule(trend: Trend, content: string): Promise<Date[]>;
  monitorTrendEvolution(trend: Trend): Promise<void>;
} 