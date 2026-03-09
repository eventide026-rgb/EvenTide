import { sendEmail } from "@/lib/brevo";
import { NextResponse } from "next/server";

/**
 * @fileOverview Standalone Email API Route.
 * Provides a dedicated endpoint for triggering transactional emails via Brevo.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, subject, htmlContent } = body;

    // Validate required fields
    if (!email || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "email, subject, and htmlContent are required" },
        { status: 400 }
      );
    }

    // Trigger Brevo delivery
    const result = await sendEmail(email, subject, htmlContent);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      details: result
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Error [send-email]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
