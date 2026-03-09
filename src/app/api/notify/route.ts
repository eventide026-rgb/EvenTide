
import { notifyUser } from "@/lib/notifications";

/**
 * @fileOverview Unified Multi-channel Notification API.
 * Orchestrates delivery via SMS, WhatsApp (Africa's Talking), and Email (Brevo)
 * using the notifyUser abstraction with EvenTide branding.
 */

export async function POST(req: Request) {
  try {
    const { phone, email, subject, message } = await req.json();

    if (!subject || !message) {
        return Response.json({ error: "Subject and message are required" }, { status: 400 });
    }

    // Construct a premium HTML wrapper for the email channel aligned with EvenTide's high-fidelity brand
    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; color: #1e293b;">
        <div style="margin-bottom: 32px; text-align: center;">
            <span style="font-family: 'Playfair Display', serif; font-weight: bold; font-size: 28px; background: linear-gradient(to right, #60A5FA, #FDE047); -webkit-background-clip: text; color: transparent; display: inline-block;">EvenTide</span>
        </div>
        <h2 style="color: #4169E1; font-size: 22px; margin-top: 0; margin-bottom: 20px; font-weight: 700;">${subject}</h2>
        <div style="font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 32px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 24px; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                Sent via the EvenTide Orchestration Engine.<br>
                <em>Your Event, Reimagined.</em>
            </p>
        </div>
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
