import { sendWhatsApp } from "@/lib/africastalking";
import { NextResponse } from "next/server";

/**
 * @fileOverview API Route to send WhatsApp messages via AfricasTalking.
 * Method: POST
 * Body: { to: string | string[], message: string }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: 'to' or 'message'" },
        { status: 400 }
      );
    }

    const result = await sendWhatsApp(to, message);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API Error [send-whatsapp]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
