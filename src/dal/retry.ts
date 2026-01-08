import "server-only";

/**
 * Configuration for retry operations
 */
export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitterRange?: number;
  retryableErrors?: readonly string[];
}

/**
 * Default retry configurations for different operation types
 */
export const RETRY_CONFIGS = {
  AUTH: {
    maxRetries: 3,
    baseDelay: 300,
    maxDelay: 1000,
    backoffMultiplier: 2,
    jitterRange: 100,
  },
  DATABASE: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 2,
    jitterRange: 200,
  },
  EXTERNAL_API: {
    maxRetries: 6,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitterRange: 500,
  },
  CACHE: {
    maxRetries: 2,
    baseDelay: 200,
    maxDelay: 800,
    backoffMultiplier: 2,
    jitterRange: 100,
  },
  FILE_UPLOAD: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitterRange: 1000,
  },
  AI: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitterRange: 1000,
  },
} as const;

/**
 * Determines if an error is retryable based on the retry configuration
 */

/**
 * Calculates the delay for the next retry attempt using exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitterRange: number
): number {
  const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attempt);
  const jitter = Math.random() * jitterRange;
  const totalDelay = exponentialDelay + jitter;

  return Math.min(totalDelay, maxDelay);
}

/**
 * Enhanced retry utility with exponential backoff, jitter, and configurable retry strategies
 * Designed for use in the data access layer
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  operationName: string = "operation"
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 5000,
    backoffMultiplier = 2,
    jitterRange = 500,
  } = config;

  let lastError: Error;
  const operationId = Math.random().toString(36).substring(2, 8);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(
          `[RETRY-${operationId}] Attempting ${operationName} - attempt ${
            attempt + 1
          }/${maxRetries + 1}`
        );
      }

      const result = await operation();

      if (attempt > 0) {
        console.log(
          `[RETRY-${operationId}] ${operationName} succeeded on attempt ${
            attempt + 1
          }`
        );
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if this is the last attempt
      if (attempt === maxRetries) {
        console.error(
          `[RETRY-${operationId}] ${operationName} failed after ${
            maxRetries + 1
          } attempts:`,
          lastError.message
        );
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        baseDelay,
        maxDelay,
        backoffMultiplier,
        jitterRange
      );

      console.warn(
        `[RETRY-${operationId}] ${operationName} failed (attempt ${
          attempt + 1
        }), retrying in ${Math.round(delay)}ms:`,
        lastError.message
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Convenience function for auth operations
 */
export function retryAuth<T>(
  operation: () => Promise<T>,
  operationName: string = "auth operation"
): Promise<T> {
  return retryWithBackoff(operation, RETRY_CONFIGS.AUTH, operationName);
}

/**
 * Convenience function for database operations
 */
export function retryDatabase<T>(
  operation: () => Promise<T>,
  operationName: string = "database operation"
): Promise<T> {
  return retryWithBackoff(operation, RETRY_CONFIGS.DATABASE, operationName);
}

/**
 * Convenience function for external API operations
 */
export function retryExternalApi<T>(
  operation: () => Promise<T>,
  operationName: string = "external API operation"
): Promise<T> {
  return retryWithBackoff(operation, RETRY_CONFIGS.EXTERNAL_API, operationName);
}

/**
 * Convenience function for cache operations
 */
export function retryCache<T>(
  operation: () => Promise<T>,
  operationName: string = "cache operation"
): Promise<T> {
  return retryWithBackoff(operation, RETRY_CONFIGS.CACHE, operationName);
}

/**
 * Convenience function for file upload operations
 */
export function retryFileUpload<T>(
  operation: () => Promise<T>,
  operationName: string = "file upload operation"
): Promise<T> {
  return retryWithBackoff(operation, RETRY_CONFIGS.FILE_UPLOAD, operationName);
}

/**
 * Convenience function for AI operations
 */
export function retryAI<T>(
  operation: () => Promise<T>,
  operationName: string = "AI operation"
): Promise<T> {
  return retryWithBackoff(operation, RETRY_CONFIGS.AI, operationName);
}
