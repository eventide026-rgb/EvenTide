import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { sendEmail } from "@/lib/brevo";

/**
 * @fileOverview Orchestration layer for multi-channel notifications.
 * Unifies delivery across Email, SMS, and WhatsApp.
 */

interface NotifyOptions {
  phone?: string | null;
  email?: string | null;
  subject: string;
  message: string;
  htmlContent?: string;
}

/**
 * Dispatches notifications across all available channels.
 * Uses allSettled to ensure that a failure in one channel doesn't block the others.
 */
export async function notifyUser({
  phone,
  email,
  subject,
  message,
  htmlContent
}: NotifyOptions) {
  const tasks = [];

  // 1. Dispatch SMS (Africa's Talking)
  if (phone) {
    tasks.push(
      sendSMS(phone, message).catch(err => {
        console.error("SMS Channel Error:", err);
        return { error: "SMS failed", details: err };
      })
    );
  }

  // 2. Dispatch WhatsApp (Africa's Talking)
  if (phone) {
    tasks.push(
      sendWhatsApp(phone, message).catch(err => {
        console.error("WhatsApp Channel Error:", err);
        return { error: "WhatsApp failed", details: err };
      })
    );
  }

  // 3. Dispatch Email (Brevo)
  if (email) {
    tasks.push(
      sendEmail(email, subject, htmlContent || message).catch(err => {
        console.error("Email Channel Error:", err);
        return { error: "Email failed", details: err };
      })
    );
  }

  try {
    const results = await Promise.allSettled(tasks);
    return results;
  } catch (error) {
    console.error("Critical Notification Pipeline Failure:", error);
    throw error;
  }
}
