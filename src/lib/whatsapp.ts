/**
 * @fileOverview WhatsApp API Utility.
 * Provides a dedicated function for sending WhatsApp messages via Africa's Talking REST API.
 */

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
) {
  const response = await fetch(
    "https://chat.africastalking.com/whatsapp/message/send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: process.env.AFRICASTALKING_API_KEY!,
      },
      body: JSON.stringify({
        username: process.env.AFRICASTALKING_USERNAME,
        waNumber: process.env.AFRICASTALKING_WHATSAPP_NUMBER,
        phoneNumber: phoneNumber,
        body: {
          text: message,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("WhatsApp API Error:", errorBody);
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
