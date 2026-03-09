import { notifyUser } from "@/lib/notifications";

/**
 * @fileOverview Unified Multi-channel Notification API.
 * Orchestrates delivery via SMS, WhatsApp (Africa's Talking), and Email (Brevo)
 * using the notifyUser abstraction.
 */

export async function POST(req: Request) {
  try {
    const { phone, email, subject, message } = await req.json();

    // Construct a standard HTML wrapper for the email channel
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4169E1; margin-top: 0;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.6;">${message}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Sent via EvenTide Notification Engine.</p>
      </div>
    `;

    const result = await notifyUser({
      phone,
      email,
      subject,
      message,
      htmlContent
    });

    return Response.json({
      success: true,
      result
    });

  } catch (error: any) {
    console.error("Notification API Error:", error);
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
