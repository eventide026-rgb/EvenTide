import Africastalking from "africastalking";

/**
 * @fileOverview AfricasTalking Service Initialization.
 * Prevents initialization crashes if environment variables are missing.
 */

let africastalking: any = null;

const apiKey = process.env.AFRICASTALKING_API_KEY;
const username = process.env.AFRICASTALKING_USERNAME;

// Only initialize if we have the required credentials to avoid validation errors
if (apiKey && username && apiKey !== 'undefined' && username !== 'undefined') {
  try {
    africastalking = Africastalking({
      apiKey: apiKey,
      username: username,
    });
  } catch (e) {
    console.warn("AfricasTalking initialization failed:", e);
  }
}

export const sms = africastalking?.SMS;
export const whatsapp = africastalking?.PAYLOADS ? africastalking.PAYLOADS.WhatsApp : null;
export const airtime = africastalking?.AIRTIME;

/**
 * Send SMS
 */
export async function sendSMS(to: string | string[], message: string) {
  if (!sms) {
    console.warn("SMS service not initialized. Skipping delivery.");
    return { status: 'Skipped', message: 'Missing Credentials' };
  }
  try {
    const response = await sms.send({ to, message });
    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

/**
 * Send WhatsApp Message
 */
export async function sendWhatsApp(to: string, message: string) {
  if (!whatsapp) {
    console.warn("WhatsApp service not initialized. Skipping delivery.");
    return { status: 'Skipped', message: 'Missing Credentials' };
  }

  try {
    const response = await whatsapp.send({ to, message });
    return response;
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    throw error;
  }
}
