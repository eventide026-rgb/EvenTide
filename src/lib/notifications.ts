import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { sendEmail } from "@/lib/brevo";

/**
 * @fileOverview Professional Orchestration layer for multi-channel notifications.
 * Unifies delivery across Email, SMS, and WhatsApp.
 */

interface NotifyOptions {
  phone?: string | null;
  email?: string | null;
  subject: string;
  message: string;
  html: string;
}

/**
 * Dispatches notifications across all available channels.
 * Uses Promise.allSettled to ensure individual channel failures do not halt the entire process.
 */
export async function notifyUser(options: NotifyOptions) {
  const { phone, email, subject, message, html } = options;
  const tasks = [];

  // 1. Dispatch Mobile Channels (Africa's Talking)
  if (phone) {
    tasks.push(sendSMS(phone, message));
    tasks.push(sendWhatsApp(phone, message));
  }

  // 2. Dispatch Email Channel (Brevo)
  if (email) {
    tasks.push(sendEmail(email, subject, html));
  }

  // 3. Parallel execution with allSettled to ensure maximum deliverability
  return Promise.allSettled(tasks);
}
