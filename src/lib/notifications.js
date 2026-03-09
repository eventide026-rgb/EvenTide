// lib/notifications.js

import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { sendEmail } from "@/lib/brevo";

/**
 * Send notifications through multiple channels
 */
export async function notifyUser({
  phone,
  email,
  subject,
  message,
  htmlContent
}) {
  const tasks = [];

  // SMS
  if (phone) {
    tasks.push(sendSMS(phone, message));
  }

  // WhatsApp
  if (phone) {
    tasks.push(sendWhatsApp(phone, message));
  }

  // Email
  if (email) {
    tasks.push(sendEmail(email, subject, htmlContent));
  }

  try {
    const results = await Promise.allSettled(tasks);

    console.log("Notification results:", results);

    return results;
  } catch (error) {
    console.error("Notification error:", error);
    throw error;
  }
}