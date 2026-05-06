/**
 * Environment variables configuration with Zod validation.
 * Ensures all required env vars are present at startup.
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  PORT: z.string().default('3000').transform(Number).pipe(z.number().min(1).max(65535)),
  PING_MESSAGE: z.string().default('pong'),
  RATE_LIMIT_WINDOW_MS: z.string().default('15000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('30').transform(Number),
  API_TIMEOUT_MS: z.string().default('30000').transform(Number),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate and return environment configuration.
 * Fails fast at startup if env vars are invalid.
 */
export function loadEnvConfig(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Load and cache config
let configCache: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!configCache) {
    configCache = loadEnvConfig();
  }
  return configCache;
}
