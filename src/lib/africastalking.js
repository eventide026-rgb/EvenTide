
/**
 * @fileOverview Redundant JS utility. Delegating to TypeScript version for safety.
 */
import { sendSMS as sendSMSTs, sendWhatsApp as sendWhatsAppTs } from './africastalking';

export async function sendSMS(to, message) {
  return sendSMSTs(to, message);
}

export async function sendWhatsApp(to, message) {
  return sendWhatsAppTs(to, message);
}
