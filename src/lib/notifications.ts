
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
  htmlContent?: string;
  templateId?: TemplateId;
  templateData?: TemplateData;
}

/**
 * Dispatches notifications across all available channels.
 * Automatically handles templates and logs results to Firestore for history tracking.
 */
export async function notifyUser(options: NotifyOptions) {
  let { subject, message, htmlContent, phone, email, templateId, templateData } = options;

  // 1. Resolve Content from Template if provided
  if (templateId && templateData) {
    const template = getTemplate(templateId, templateData);
    subject = subject || template.subject;
    message = message || template.text;
    htmlContent = htmlContent || template.html;
  }

  if (!subject || !message) {
    throw new Error("Missing content: subject or message must be provided or resolvable via template.");
  }

  const tasks = [];

  // 2. Dispatch SMS (Africa's Talking)
  if (phone) {
    tasks.push(
      sendSMS(phone, message).then(res => ({ channel: 'sms', status: 'success', details: res }))
        .catch(err => ({ channel: 'sms', status: 'error', details: err.message }))
    );
  }

  // 3. Dispatch WhatsApp (Africa's Talking)
  if (phone) {
    tasks.push(
      sendWhatsApp(phone, message).then(res => ({ channel: 'whatsapp', status: 'success', details: res }))
        .catch(err => ({ channel: 'whatsapp', status: 'error', details: err.message }))
    );
  }

  // 4. Dispatch Email (Brevo)
  if (email) {
    tasks.push(
      sendEmail(email, subject, htmlContent || message).then(res => ({ channel: 'email', status: 'success', details: res }))
        .catch(err => ({ channel: 'email', status: 'error', details: err.message }))
    );
  }

  try {
    const rawResults = await Promise.all(tasks);
    const channelResults = rawResults.reduce((acc: any, curr: any) => {
        acc[curr.channel] = { status: curr.status, details: curr.details };
        return acc;
    }, {});

    // 5. Audit Logging to Firestore
    try {
        await adminDb.collection('notification_logs').add({
            recipient: { email, phone },
            subject,
            message,
            templateId: templateId || null,
            results: channelResults,
            timestamp: new Date().toISOString()
        });
    } catch (logError) {
        console.error("Failed to log notification to database:", logError);
    }

    return channelResults;
  } catch (error) {
    console.error("Critical Notification Pipeline Failure:", error);
    throw error;
  }
}
