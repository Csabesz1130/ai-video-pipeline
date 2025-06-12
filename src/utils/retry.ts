/**
 * Options for the retry with backoff function
 */
interface RetryOptions {
  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;
  
  /**
   * Initial delay in milliseconds
   */
  initialDelayMs?: number;
  
  /**
   * Factor to multiply delay by after each attempt
   */
  backoffFactor?: number;
  
  /**
   * Maximum delay between retries in milliseconds
   */
  maxDelayMs?: number;
  
  /**
   * Function to determine if an error should trigger a retry
   * @param error The error that occurred
   * @returns true if the operation should be retried, false otherwise
   */
  shouldRetry?: (error: Error) => boolean;
  
  /**
   * Function to log retry attempts
   * @param attempt Current attempt number
   * @param error Error that triggered the retry
   * @param delayMs Delay before next retry in milliseconds
   */
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

/**
 * Default retry options
 */
const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 30000,
  shouldRetry: () => true,
  onRetry: () => {}
};

/**
 * Retries an asynchronous operation with exponential backoff
 * 
 * @param operation The async function to retry
 * @param options Configuration options for the retry behavior
 * @returns Promise that resolves with the result of the operation or rejects with the last error
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // Merge options with defaults
  const config: Required<RetryOptions> = {
    ...defaultRetryOptions,
    ...options
  };
  
  let attempt = 0;
  let lastError: Error = new Error('Retry exhausted');
  
  while (attempt <= config.maxRetries) {
    try {
      // Attempt the operation
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;
      
      // If we've used all retries or shouldn't retry this error, rethrow
      if (attempt > config.maxRetries || !config.shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelayMs
      );
      
      // Call the onRetry callback
      config.onRetry(attempt, lastError, delayMs);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // This should never happen due to the throw inside the loop
  // but TypeScript needs this to avoid "Function lacks ending return statement"
  throw lastError;
}

/**
 * Retry with backoff and return a default value if all retries fail
 * 
 * @param operation The async function to retry
 * @param defaultValue The default value to return if all retries fail
 * @param options Configuration options for the retry behavior
 * @returns Promise that resolves with the result of the operation or the default value
 */
export async function retryWithBackoffOrDefault<T>(
  operation: () => Promise<T>,
  defaultValue: T,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await retryWithBackoff(operation, options);
  } catch (_error) {
    return defaultValue;
  }
} 