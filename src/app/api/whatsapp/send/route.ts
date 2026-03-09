import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Direct WhatsApp Delivery API Route.
 */

export async function POST(req: Request) {
  try {
    const { phoneNumber, message } = await req.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, error: "Missing phoneNumber or message" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage(phoneNumber, message);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("API Route Error [whatsapp-send]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
