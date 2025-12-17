/**
 * Environment configuration with validation
 */

const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const;

const optionalEnvVars = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:3000',
} as const;

// Validate required environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
} as const;

export type Env = typeof env;
