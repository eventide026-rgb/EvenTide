import Africastalking from "africastalking";

/**
 * @fileOverview Africastalking utility for SMS, WhatsApp and Airtime services.
 * Requires the following environment variables:
 * - AFRICASTALKING_API_KEY
 * - AFRICASTALKING_USERNAME
 * - AFRICASTALKING_WHATSAPP_CHANNEL (The name/number of your configured WhatsApp channel)
 */

const africastalking = Africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY || '',
  username: process.env.AFRICASTALKING_USERNAME || '',
});

export const sms = africastalking.SMS;
export const airtime = africastalking.AIRTIME;

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
 * Africa's Talking uses the SMS API for WhatsApp by specifying the 'from' channel.
 * @param to - Recipient(s) phone number(s) in international format (e.g., +234...)
 * @param message - The message content
 * @returns - Response from Africa's Talking
 */
export async function sendWhatsApp(to: string | string[], message: string) {
  try {
    const response = await sms.send({
      to,
      message,
      // The 'from' field must exactly match your configured WhatsApp channel name or number in AT
      from: process.env.AFRICASTALKING_WHATSAPP_CHANNEL || "your_whatsapp_channel_name",
    });
    console.log("WhatsApp Sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending WhatsApp message via AfricasTalking:", error);
    throw error;
  }
}
