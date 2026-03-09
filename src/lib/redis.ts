
import { Redis } from "@upstash/redis";

/**
 * @fileOverview Upstash Redis instance configuration.
 * Used for managing the high-performance notification queue.
 */

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Redis environment variables are missing. Notification queueing will fail.");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
