import { sendSMS, sendWhatsApp } from "@/lib/africastalking";
import { sendEmail } from "@/lib/brevo";
import { NextResponse } from "next/server";

/**
 * @fileOverview Unified Multi-channel Notification API.
 * Orchestrates delivery via SMS, WhatsApp (Africa's Talking), and Email (Brevo).
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, message, email, subject, htmlContent } = body;

    const deliveryTasks: Promise<any>[] = [];

    // Queue Mobile Tasks (SMS & WhatsApp)
    if (phoneNumber && message) {
      deliveryTasks.push(
        sendSMS(phoneNumber, message).catch(err => ({ error: 'SMS Failed', details: err.message }))
      );
      deliveryTasks.push(
        sendWhatsApp(phoneNumber, message).catch(err => ({ error: 'WhatsApp Failed', details: err.message }))
      );
    }

    // Queue Email Task (Brevo)
    if (email && (htmlContent || message)) {
      deliveryTasks.push(
        sendEmail(
          email, 
          subject || 'Notification from EvenTide', 
          htmlContent || `<p>${message}</p>`
        ).catch(err => ({ error: 'Email Failed', details: err.message }))
      );
    }

    if (deliveryTasks.length === 0) {
      return NextResponse.json(
        { error: "No valid delivery channels (phone or email) provided." },
        { status: 400 }
      );
    }

    // Use allSettled so one channel failure doesn't block the others
    const results = await Promise.allSettled(deliveryTasks);

    return NextResponse.json({
      success: true,
      message: "Notifications processed",
      results: results.map((r, i) => ({
        channel: i === 0 ? 'SMS' : i === 1 ? 'WhatsApp' : 'Email',
        status: r.status,
        // @ts-ignore
        details: r.status === 'fulfilled' ? r.value : r.reason
      }))
    }, { status: 200 });

  } catch (error: any) {
    console.error("Unified Notification API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
