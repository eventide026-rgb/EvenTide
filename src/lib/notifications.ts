import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { sendEmail } from "@/lib/brevo";
import { adminDb } from "@/firebase/firebaseAdmin";

/**
 * @fileOverview Professional Orchestration layer for multi-channel notifications.
 * Unifies delivery across Email, SMS, and WhatsApp with detailed audit logging.
 */

interface NotifyOptions {
  phone?: string | null;
  email?: string | null;
  subject: string;
  message: string;
  html: string;
  type?: string; // The template or notification type identifier
}

/**
 * Dispatches notifications across all available channels and captures the result for auditing.
 * Stores a comprehensive log in the 'notification_logs' collection.
 */
export async function notifyUser(options: NotifyOptions) {
  const { phone, email, subject, message, html, type = "manual" } = options;
  const tasks: Promise<any>[] = [];
  const channels: string[] = [];

  // 1. Mobile Tasks (SMS & WhatsApp via Africa's Talking)
  if (phone) {
    channels.push('sms', 'whatsapp');
    tasks.push(
      sendSMS(phone, message)
        .then(res => ({ channel: 'sms', status: 'success', details: res }))
        .catch(err => ({ channel: 'sms', status: 'error', error: err.message }))
    );
    tasks.push(
      sendWhatsApp(phone, message)
        .then(res => ({ channel: 'whatsapp', status: 'success', details: res }))
        .catch(err => ({ channel: 'whatsapp', status: 'error', error: err.message }))
    );
  }

  // 2. Email Task (Transactional via Brevo)
  if (email) {
    channels.push('email');
    tasks.push(
      sendEmail(email, subject, html)
        .then(res => ({ channel: 'email', status: 'success', details: res }))
        .catch(err => ({ channel: 'email', status: 'error', error: err.message }))
    );
  }

  // 3. Parallel Dispatch
  const results = await Promise.all(tasks);

  // 4. Determine Overall Status
  const hasError = results.some(r => r.status === 'error');
  const status = hasError ? (results.every(r => r.status === 'error') ? 'failed' : 'partial_success') : 'sent';

  // 5. Enterprise Audit Logging
  try {
    await adminDb.collection('notification_logs').add({
        type,
        channels,
        status,
        recipient: { 
            phone: phone || null, 
            email: email || null 
        },
        content: {
            subject,
            message: message.substring(0, 500) // Truncate long messages for the log
        },
        deliveryDetails: results,
        createdAt: new Date().toISOString(),
        timestamp: new Date()
    });
  } catch (logError) {
      console.error("CRITICAL: Audit Log Failure:", logError);
  }

  return results;
}
