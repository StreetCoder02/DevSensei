/**
 * Backend utility functions for logging, error handling, and JSON operations.
 */

/**
 * Simple logger utility for consistent logging across the backend.
 * In production, this can be replaced with Winston, Pino, or similar.
 */
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(
        `[ERROR] ${message}`,
        error instanceof Error ? error.message : JSON.stringify(error)
      );
    }
  },
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
    }
  },
};

/**
 * Safely parse JSON with fallback.
 * Prevents crashes from malformed Gemini responses.
 */
export function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    logger.error('Failed to parse JSON', error);
    return fallback;
  }
}

/**
 * Format success API response.
 */
export function formatSuccess<T>(data: T, statusCode: number = 200) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}

/**
 * Format error API response.
 */
export function formatError(message: string, statusCode: number = 500, error?: any) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      ...(process.env.NODE_ENV === 'development' && error && {
        error: error instanceof Error ? error.message : String(error),
      }),
    }),
  };
}

/**
 * Validate query parameters against allowed values.
 */
export function validateQueryParam(
  value: string | undefined,
  allowed: string[],
  defaultValue: string
): string {
  if (!value) return defaultValue;
  const normalized = value.toLowerCase();
  return allowed.includes(normalized) ? normalized : defaultValue;
}

/**
 * Create a timeout promise for async operations.
 */
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
}

/**
 * Race a promise against a timeout.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([promise, createTimeout(timeoutMs)]);
}
