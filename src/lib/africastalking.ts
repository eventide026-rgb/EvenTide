import Africastalking from "africastalking";

const africastalking = Africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY || "",
  username: process.env.AFRICASTALKING_USERNAME || "",
});

export const sms = africastalking.SMS;
export const whatsapp = africastalking.PAYLOADS ? africastalking.PAYLOADS.WhatsApp : null;
export const airtime = africastalking.AIRTIME;

/**
 * Send SMS
 */
export async function sendSMS(to: string | string[], message: string) {
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
 * Send WhatsApp Message (requires Africa's Talking WhatsApp approval)
 */
export async function sendWhatsApp(to: string, message: string) {
  if (!whatsapp) throw new Error("WhatsApp not enabled in Africa's Talking account.");

  try {
    const response = await whatsapp.send({ to, message });
    console.log("WhatsApp Sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    throw error;
  }
}

/**
 * Send Airtime
 */
export async function sendAirtime(recipients: { phoneNumber: string; amount: string }[]) {
  try {
    const response = await airtime.send({ recipients });
    console.log("Airtime Sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending Airtime:", error);
    throw error;
  }
}