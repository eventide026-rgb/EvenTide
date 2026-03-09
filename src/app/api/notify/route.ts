import { notifyUser } from "@/lib/notifications";
import { templates } from "@/lib/templates";
import { NextResponse } from "next/server";

/**
 * @fileOverview High-Fidelity Unified Notification API endpoint.
 * Dispatches alerts via Email, SMS, and WhatsApp using reusable templates.
 * Includes automated logging for enterprise tracking.
 */

export async function POST(req: Request) {
  try {
    const { type, phone, email, data } = await req.json();

    // 1. Resolve Content from Template
    if (!templates[type]) {
      return NextResponse.json({ error: `Invalid template type: ${type}` }, { status: 400 });
    }

    const template = templates[type](data);

    // 2. Dispatch via Orchestration Engine (which handles logging internally)
    const result = await notifyUser({
      type,
      phone,
      email,
      subject: template.subject,
      message: template.message,
      html: template.html
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
