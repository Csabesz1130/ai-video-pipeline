import * as dotenv from 'dotenv';
import { join } from 'path';
import { Logger } from './utils/logger';

// Load environment variables from .env file
dotenv.config({ path: join(process.cwd(), '.env') });

const logger = new Logger('Config');

/**
 * Social media platform API configurations
 */
export interface PlatformConfig {
  tiktok?: {
    apiKey: string;
    apiSecret: string;
  };
  
  youtube?: {
    apiKey: string;
    clientId: string;
    clientSecret: string;
  };
  
  instagram?: {
    accessToken: string;
    appId: string;
    appSecret: string;
  };
  
  twitter?: {
    apiKey: string;
    apiSecret: string;
    bearerToken: string;
  };
}

/**
 * Application configuration
 */
export interface Config extends PlatformConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  trendPollingEnabled: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    logger.warn(`Environment variable ${key} not set`);
    return '';
  }
  return value;
}

/**
 * Get boolean environment variable
 */
function getBoolEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

/**
 * Get number environment variable
 */
function getNumEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Load and validate configuration
 */
export function loadConfig(): Config {
  const config: Config = {
    port: getNumEnv('PORT', 3000),
    environment: (getEnv('NODE_ENV', 'development') as Config['environment']),
    logLevel: (getEnv('LOG_LEVEL', 'info') as Config['logLevel']),
    trendPollingEnabled: getBoolEnv('TREND_POLLING_ENABLED', true),
    
    // Platform configurations
    tiktok: {
      apiKey: getEnv('TIKTOK_API_KEY'),
      apiSecret: getEnv('TIKTOK_API_SECRET')
    },
    
    youtube: {
      apiKey: getEnv('YOUTUBE_API_KEY'),
      clientId: getEnv('YOUTUBE_CLIENT_ID'),
      clientSecret: getEnv('YOUTUBE_CLIENT_SECRET')
    },
    
    instagram: {
      accessToken: getEnv('INSTAGRAM_ACCESS_TOKEN'),
      appId: getEnv('INSTAGRAM_APP_ID'),
      appSecret: getEnv('INSTAGRAM_APP_SECRET')
    },
    
    twitter: {
      apiKey: getEnv('TWITTER_API_KEY'),
      apiSecret: getEnv('TWITTER_API_SECRET'),
      bearerToken: getEnv('TWITTER_BEARER_TOKEN')
    }
  };
  
  // Validate configuration
  validateConfig(config);
  
  return config;
}

/**
 * Validate configuration values
 */
function validateConfig(config: Config): void {
  if (config.environment !== 'development' && config.environment !== 'production' && config.environment !== 'test') {
    logger.warn(`Invalid environment: ${config.environment}, defaulting to development`);
    config.environment = 'development';
  }
  
  if (config.logLevel !== 'debug' && config.logLevel !== 'info' && config.logLevel !== 'warn' && config.logLevel !== 'error') {
    logger.warn(`Invalid log level: ${config.logLevel}, defaulting to info`);
    config.logLevel = 'info';
  }
  
  // Remove platforms with incomplete configuration
  if (!config.tiktok?.apiKey || !config.tiktok?.apiSecret) {
    logger.warn('TikTok API configuration incomplete, disabling TikTok trend monitoring');
    config.tiktok = undefined;
  }
  
  if (!config.youtube?.apiKey || !config.youtube?.clientId || !config.youtube?.clientSecret) {
    logger.warn('YouTube API configuration incomplete, disabling YouTube trend monitoring');
    config.youtube = undefined;
  }
  
  if (!config.instagram?.accessToken || !config.instagram?.appId || !config.instagram?.appSecret) {
    logger.warn('Instagram API configuration incomplete, disabling Instagram trend monitoring');
    config.instagram = undefined;
  }
  
  if (!config.twitter?.apiKey || !config.twitter?.apiSecret || !config.twitter?.bearerToken) {
    logger.warn('Twitter API configuration incomplete, disabling Twitter trend monitoring');
    config.twitter = undefined;
  }
}

// Export default config instance
const config = loadConfig();
export default config; 