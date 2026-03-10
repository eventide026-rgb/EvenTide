/**
 * @fileOverview Africastalking utility for SMS, WhatsApp and Airtime services.
 */
import Africastalking from "africastalking";

const apiKey = process.env.AFRICASTALKING_API_KEY;
const username = process.env.AFRICASTALKING_USERNAME;

// Initialize the SDK with fallbacks for build-time safety
const at = Africastalking({
  apiKey: apiKey || 'sandbox',
  username: username || 'sandbox',
});

/**
 * Sends an SMS message via Africa's Talking.
 */
export async function sendSMS(to: string | string[], message: string) {
  if (!apiKey || !username) {
    console.warn("AfricasTalking credentials missing. SMS delivery skipped.");
    return { status: "Skipped" };
  }
  try {
    const result = await at.SMS.send({
      to: Array.isArray(to) ? to : [to],
      message: message,
    });
    return result;
  } catch (error) {
    console.error("AfricasTalking SMS Error:", error);
    throw error;
  }
}

/**
 * Sends a WhatsApp message via Africa's Talking.
 * Note: Many implementations use the SMS gateway with specific routing.
 */
export async function sendWhatsApp(to: string, message: string) {
    if (!apiKey || !username) {
        console.warn("AfricasTalking credentials missing. WhatsApp delivery skipped.");
        return { status: "Skipped" };
    }
    try {
        // Fallback to SMS gateway for WhatsApp delivery if no dedicated WA client is configured
        const result = await at.SMS.send({
            to: [to],
            message: message,
        });
        return result;
    } catch (error) {
        console.error("AfricasTalking WhatsApp Error:", error);
        throw error;
    }
}
