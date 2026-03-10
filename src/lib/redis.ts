import { Redis } from "@upstash/redis";

/**
 * @fileOverview Silent Upstash Redis initialization.
 * Prevents warnings and crashes if environment variables are missing.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Only initialize if the URL is valid and contains 'http'
const isValidConfig = url && url.startsWith('http') && token;

export const redis = isValidConfig 
  ? new Redis({ url, token }) 
  : null;

if (!isValidConfig && process.env.NODE_ENV === 'production') {
    console.info("Upstash Redis: Configuration not found. Notification queueing is in standby mode.");
}
