import Africastalking from "africastalking";

/**
 * @fileOverview Africastalking utility for SMS, WhatsApp and Airtime services.
 * Requires AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME environment variables.
 */

const africastalking = Africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY || '',
  username: process.env.AFRICASTALKING_USERNAME || '',
});

export const sms = africastalking.SMS;
export const airtime = africastalking.AIRTIME;
// @ts-ignore
export const whatsapp = africastalking.WHATSAPP;

/**
 * Send an SMS via AfricasTalking
 * @param to - Recipient(s) phone number(s) in international format (e.g., +234...)
 * @param message - The message content
 * @returns - Response from Africa's Talking
 */
export async function sendSMS(to: string | string[], message: string) {
  try {
    const response = await sms.send({ to, message });
    console.log("SMS Sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending SMS via AfricasTalking:", error);
    throw error;
  }
}

/**
 * Send a WhatsApp message via AfricasTalking
 * @param to - Recipient(s) phone number(s) in international format (e.g., +234...)
 * @param message - The message content
 * @returns - Response from Africa's Talking
 */
export async function sendWhatsApp(to: string | string[], message: string) {
  try {
    // @ts-ignore
    const response = await whatsapp.send({ to, message });
    console.log("WhatsApp Sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending WhatsApp message via AfricasTalking:", error);
    throw error;
  }
}
