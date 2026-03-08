// lib/africastalking.js
import Africastalking from "africastalking";

const africastalking = Africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});

// SMS service
export const sms = africastalking.SMS;

// WhatsApp service
export const whatsapp = africastalking.WHATSAPP;

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

/**
 * Send a WhatsApp message
 * @param {string | string[]} to - Recipient(s) phone number(s) in international format
 * @param {string} message - The message content
 * @returns {Promise<Object>} - Response from Africa's Talking
 */
export async function sendWhatsApp(to, message) {
  try {
    const response = await whatsapp.send({ to, message });
    console.log("WhatsApp Sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}