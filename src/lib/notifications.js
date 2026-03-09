
/**
 * @fileOverview Redundant JS utility. Delegating to TypeScript version for orchestration.
 */
import { notifyUser as notifyUserTs } from './notifications';

export async function notifyUser(options) {
  return notifyUserTs(options);
}
