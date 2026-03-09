
import { redis } from "./redis";

/**
 * @fileOverview Notification Queue Management.
 * Implements FIFO (First-In-First-Out) logic using Redis LPUSH/RPOP.
 */

const QUEUE_NAME = "notification_queue";

/**
 * Pushes a notification payload into the Redis-backed queue.
 * @param data The notification data (type, phone, email, etc.)
 */
export async function addNotificationToQueue(data: any) {
  try {
    await redis.lpush(QUEUE_NAME, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to add notification to queue:", error);
    throw error;
  }
}

/**
 * Retrieves and removes the next notification from the queue.
 * @returns The notification data or null if the queue is empty.
 */
export async function getNextNotification() {
  try {
    const item = await redis.rpop(QUEUE_NAME);

    if (!item) return null;

    return typeof item === 'string' ? JSON.parse(item) : item;
  } catch (error) {
    console.error("Failed to fetch next notification from queue:", error);
    return null;
  }
}
