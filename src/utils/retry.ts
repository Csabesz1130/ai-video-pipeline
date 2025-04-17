import { Logger } from './logger';

const logger = new Logger('Retry');

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        logger.error('Max retries reached', {
          error: lastError.message,
          attempts: attempt
        });
        throw lastError;
      }
      
      const delay = initialDelay * Math.pow(2, attempt - 1);
      logger.warn('Operation failed, retrying', {
        error: lastError.message,
        attempt,
        nextRetryIn: `${delay}ms`
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
} 