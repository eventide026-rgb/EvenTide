
import { getNextNotification } from "@/lib/notificationQueue";
import { notifyUser } from "@/lib/notifications";
import { templates } from "@/lib/templates";
import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/firebaseAdmin";

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Notification Queue Worker API Route.
 * Processes the next job in the FIFO queue and dispatches via tri-channel delivery.
 */

export async function GET() {
  try {
    // 1. Safety check for Admin SDK
    if (!adminDb) {
      return NextResponse.json({ error: "Backend services not available" }, { status: 503 });
    }

    const job = await getNextNotification();

    if (!job) {
      return NextResponse.json({ message: "No jobs in queue" });
    }

    const { type, phone, email, data } = job;

    // 2. Resolve Template and Dispatch
    if (type && templates[type]) {
      // Pass an empty object fallback to prevent template crashes
      const template = templates[type](data || {});
      
      await notifyUser({
        phone,
        email,
        subject: template.subject,
        message: template.message,
        html: template.html,
        type
      });
    } else {
      // Fallback for manual or untemplated messages
      await notifyUser({
        phone: job.phone || null,
        email: job.email || null,
        subject: job.subject || "EvenTide Update",
        message: job.message || "",
        html: job.html || job.message || "",
        type: job.type || 'manual'
      });
    }

    return NextResponse.json({
      success: true,
      message: "Job processed successfully",
      processedJob: {
          type: type || 'manual',
          recipient: email || phone || 'unknown'
      }
    });

  } catch (error: any) {
    console.error("CRITICAL: Notification Worker Failure:", error);
    return NextResponse.json(
      { error: error.message || "Internal Worker Error" },
      { status: 500 }
    );
  }
}
