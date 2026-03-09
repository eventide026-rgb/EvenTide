import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { sendEmail } from "@/lib/brevo";
import { adminDb } from "@/firebase/firebaseAdmin";

/**
 * @fileOverview Professional Orchestration layer for multi-channel notifications.
 * Unifies delivery across Email, SMS, and WhatsApp.
 * 
 * Features:
 * - Independent channel execution (failure in one doesn't block others).
 * - Automatic audit logging to the 'notification_logs' collection.
 */

interface NotifyOptions {
  phone?: string | null;
  email?: string | null;
  subject: string;
  message: string;
  html: string;
}

/**
 * Dispatches notifications across all available channels and captures the result for auditing.
 */
export async function notifyUser(options: NotifyOptions) {
  const { phone, email, subject, message, html } = options;
  const tasks: Promise<any>[] = [];

  // 1. Mobile Tasks (SMS & WhatsApp via Africa's Talking)
  if (phone) {
    tasks.push(
      sendSMS(phone, message)
        .then(res => ({ channel: 'SMS', status: 'success', details: res }))
        .catch(err => ({ channel: 'SMS', status: 'error', error: err.message }))
    );
    tasks.push(
      sendWhatsApp(phone, message)
        .then(res => ({ channel: 'WhatsApp', status: 'success', details: res }))
        .catch(err => ({ channel: 'WhatsApp', status: 'error', error: err.message }))
    );
  }

  // 2. Email Task (Transactional via Brevo)
  if (email) {
    tasks.push(
      sendEmail(email, subject, html)
        .then(res => ({ channel: 'Email', status: 'success', details: res }))
        .catch(err => ({ channel: 'Email', status: 'error', error: err.message }))
    );
  }

  // 3. Parallel Dispatch
  const results = await Promise.all(tasks);

  // 4. Automated Audit Logging
  try {
    await adminDb.collection('notification_logs').add({
        recipient: { phone: phone || null, email: email || null },
        subject,
        message,
        results,
        timestamp: new Date()
    });
  } catch (logError) {
      console.error("Audit Log Failure:", logError);
  }

  return results;
}
