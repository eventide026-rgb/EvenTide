
import { notifyUser } from "@/lib/notifications";
import { NextResponse } from "next/server";

/**
 * @fileOverview High-Fidelity Unified Notification API endpoint.
 * Dispatches alerts via Email, SMS, and WhatsApp using the professional orchestrator.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        phone, 
        email, 
        subject, 
        message, 
        templateId, 
        templateData 
    } = body;

    // The orchestrator handles template resolution, logging, and tri-channel delivery
    const result = await notifyUser({
      phone,
      email,
      subject,
      message,
      templateId,
      templateData
    });

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error: any) {
    console.error("API Route Error [notify]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
