
import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { sendEmail } from "@/lib/brevo";
import { getTemplate, type TemplateId, type TemplateData } from "./templates";
import { adminDb } from "@/firebase/firebaseAdmin";

/**
 * @fileOverview Professional Orchestration layer for multi-channel notifications.
 * Unifies delivery across Email, SMS, and WhatsApp with template support and audit logging.
 */

interface NotifyOptions {
  phone?: string | null;
  email?: string | null;
  subject?: string;
  message?: string;
  html?: string;
  templateId?: TemplateId;
  templateData?: TemplateData;
}

/**
 * Dispatches notifications across all available channels.
 * Automatically handles templates and logs results to Firestore for history tracking.
 */
export async function notifyUser(options: NotifyOptions) {
  let { subject, message, html, phone, email, templateId, templateData } = options;

  // 1. Resolve Content from Template if provided
  if (templateId && templateData) {
    const template = getTemplate(templateId, templateData);
    subject = subject || template.subject;
    message = message || template.text;
    html = html || template.html;
  }

  if (!subject || !message) {
    throw new Error("Missing content: subject or message must be provided or resolvable via template.");
  }

  const tasks = [];

  // 2. Dispatch Mobile Channels (Africa's Talking)
  if (phone) {
    tasks.push(sendSMS(phone, message));
    tasks.push(sendWhatsApp(phone, message));
  }

  // 3. Dispatch Email Channel (Brevo)
  if (email) {
    tasks.push(sendEmail(email, subject, html || message));
  }

  // 4. Parallel execution with allSettled to ensure maximum deliverability
  const results = await Promise.allSettled(tasks);

  // 5. Audit Logging to Firestore for history tracking
  try {
    await adminDb.collection('notification_logs').add({
      recipient: { email, phone },
      subject,
      message,
      templateId: templateId || null,
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    console.error("Failed to log notification to database:", logError);
  }

  return results;
}
