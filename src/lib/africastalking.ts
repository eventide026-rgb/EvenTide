
import Africastalking from "africastalking";

/**
 * @fileOverview Africastalking utility for SMS and WhatsApp services.
 * Safely handles missing environment variables during the build phase and runtime.
 */

const apiKey = process.env.AFRICASTALKING_API_KEY;
const username = process.env.AFRICASTALKING_USERNAME;

let atInstance: any;
let smsService: any;

// CRITICAL: Only initialize if BOTH required credentials are present
// This prevents the SDK from throwing a "username is required" error during build.
if (apiKey && username && apiKey !== 'undefined' && username !== 'undefined') {
  try {
    atInstance = Africastalking({ apiKey, username });
    smsService = atInstance.SMS;
  } catch (e) {
    console.error("Failed to initialize Africastalking:", e);
  }
}

export const sms = smsService;

/**
 * Send an SMS via AfricasTalking
 */
export async function sendSMS(to: string | string[], message: string) {
  if (!smsService) {
    console.warn("SMS service not initialized. Skipping delivery.");
    return { status: 'skipped', reason: 'missing_config' };
  }
  try {
    const response = await smsService.send({ to, message });
    console.log("SMS Sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending SMS via AfricasTalking:", error);
    throw error;
  }
}

/**
 * Send a WhatsApp message via AfricasTalking
 */
export async function sendWhatsApp(to: string | string[], message: string) {
  if (!smsService) {
    console.warn("WhatsApp service not initialized. Skipping delivery.");
    return { status: 'skipped', reason: 'missing_config' };
  }
  try {
    const response = await smsService.send({
      to,
      message,
      from: process.env.AFRICASTALKING_WHATSAPP_CHANNEL || "EvenTide",
    });
    console.log("WhatsApp Sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending WhatsApp message via AfricasTalking:", error);
    throw error;
  }
}
