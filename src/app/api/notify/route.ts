import { notifyUser } from "@/lib/notifications";
import { NextResponse } from "next/server";

/**
 * @fileOverview High-Fidelity Unified Notification API endpoint.
 * Accepts details for phone and email alerts, wraps content in a premium
 * HTML template for email, and dispatches via the notifications orchestrator.
 */

export async function POST(req: Request) {
  try {
    const { phone, email, subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
    }

    // High-Fidelity HTML Wrapper for the Email Channel
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }
          .logo { font-family: 'Playfair Display', serif; font-weight: bold; font-size: 32px; background: linear-gradient(to right, #60A5FA, #FDE047); -webkit-background-clip: text; color: transparent; }
          .content { padding: 40px; color: #1e293b; line-height: 1.7; }
          .footer { padding: 24px; text-align: center; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
          h2 { color: #4169E1; margin-top: 0; font-weight: 700; font-size: 24px; }
          .message { color: #475569; font-size: 16px; margin-bottom: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">EvenTide</span>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div class="footer">
            <p>Sent via the EvenTide Orchestration Engine. Your Event, Reimagined.</p>
            <p>&copy; ${new Date().getFullYear()} EvenTide App</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await notifyUser({
      phone,
      email,
      subject,
      message,
      htmlContent
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
