// lib/africastalking.js
import Africastalking from "africastalking";

const africastalking = Africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});

export const sms = africastalking.SMS;

/**
 * Send an SMS
 * @param {string | string[]} to - Recipient(s) phone number(s) in international format
 * @param {string} message - The message content
 * @returns {Promise<Object>} - Response from Africa's Talking
 */
export async function sendSMS(to, message) {
  try {
    const response = await sms.send({ to, message });
    console.log("SMS Sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}