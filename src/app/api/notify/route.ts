import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { NextResponse } from "next/server";

/**
 * @fileOverview Combined Notification API Route (App Router).
 * Sends both SMS and WhatsApp messages to a phone number.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "phoneNumber and message are required" },
        { status: 400 }
      );
    }

    // Send both notifications concurrently
    const [smsResult, whatsappResult] = await Promise.all([
      sendSMS(phoneNumber, message),
      sendWhatsApp(phoneNumber, message)
    ]);

    return NextResponse.json({
      success: true,
      message: "Messages sent successfully",
      details: {
        sms: smsResult,
        whatsapp: whatsappResult
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Notification API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
