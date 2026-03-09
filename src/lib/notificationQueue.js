
/**
 * @fileOverview Legacy JS utility. Delegating to TypeScript version for safety.
 */
import { addNotificationToQueue as addTs, getNextNotification as getNextTs } from './notificationQueue';

export async function addNotificationToQueue(data) {
  return addTs(data);
}

export async function getNextNotification() {
  return getNextTs();
}
