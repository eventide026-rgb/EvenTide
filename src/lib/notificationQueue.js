import { redis } from "./redis";

const QUEUE_NAME = "notification_queue";

export async function addNotificationToQueue(data) {
  await redis.lpush(QUEUE_NAME, JSON.stringify(data));
}

export async function getNextNotification() {
  const item = await redis.rpop(QUEUE_NAME);

  if (!item) return null;

  return JSON.parse(item);
}