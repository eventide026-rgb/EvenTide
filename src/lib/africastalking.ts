import Africastalking from "africastalking";

/**
 * @fileOverview Africastalking utility for SMS and WhatsApp services.
 * Requires the following environment variables:
 * - AFRICASTALKING_API_KEY
 * - AFRICASTALKING_USERNAME
 * - AFRICASTALKING_WHATSAPP_CHANNEL (The exact name of your WhatsApp channel in AT)
 */

const africastalking = Africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY || '',
  username: process.env.AFRICASTALKING_USERNAME || '',
});

export const sms = africastalking.SMS;

/**
 * Send an SMS via AfricasTalking
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
 * WhatsApp uses the SMS API but requires the specific 'from' channel identifier.
 */
export async function sendWhatsApp(to: string | string[], message: string) {
  try {
    const response = await sms.send({
      to,
      message,
      // Must match your configured WhatsApp channel in the AT dashboard
      from: process.env.AFRICASTALKING_WHATSAPP_CHANNEL || "EvenTide",
    });
    console.log("WhatsApp Sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending WhatsApp message via AfricasTalking:", error);
    throw error;
  }
}
