
import { Redis } from "@upstash/redis";

/**
 * @fileOverview Upstash Redis instance configuration.
 * Used for managing the high-performance notification queue.
 * Safely handles missing environment variables during the build phase.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = (url && token) 
  ? new Redis({ url, token }) 
  : null as unknown as Redis;

if (!url || !token) {
    if (process.env.NODE_ENV === 'production') {
        console.warn("Redis environment variables are missing. Notification queueing will be disabled.");
    }
}
