/**
 * @fileOverview WhatsApp API Utility.
 * Provides a dedicated function for sending WhatsApp messages via Africa's Talking REST API.
 */

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
) {
  // 1. Verify Environment Readiness
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;
  const waNumber = process.env.AFRICASTALKING_WHATSAPP_NUMBER;

  if (!apiKey || !username || !waNumber) {
    console.warn("WhatsApp: Missing credentials in environment. Skipping delivery.");
    return { success: false, status: "Missing Credentials" };
  }

  // 2. Execute Dispatch to Africa's Talking
  const response = await fetch(
    "https://chat.africastalking.com/whatsapp/message/send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: apiKey,
      },
      body: JSON.stringify({
        username: username,
        waNumber: waNumber,
        phoneNumber: phoneNumber,
        body: {
          text: message, // AT uses 'text' key for standard WhatsApp messages
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("WhatsApp API Error Response:", errorBody);
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("WhatsApp Dispatch Result:", data);
  return data;
}
