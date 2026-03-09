import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { phoneNumber, message } = await req.json();

    const result = await sendWhatsAppMessage(phoneNumber, message);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("WhatsApp API Route Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
