
import { getNextNotification } from "@/lib/notificationQueue";
import { notifyUser } from "@/lib/notifications";
import { templates } from "@/lib/templates";
import { NextResponse } from "next/server";

/**
 * @fileOverview Notification Queue Worker API Route.
 * This endpoint is designed to be called by a periodic scheduler (Cron).
 * 
 * Flow:
 * 1. Pull the next notification job from the Redis queue (FIFO).
 * 2. Resolve the appropriate brand template based on the job type.
 * 3. Orchestrate tri-channel delivery (Email, SMS, WhatsApp) via the notification service.
 * 4. Record the audit log in Firestore.
 */

export async function GET() {
  try {
    // 1. Retrieve the next job from the high-performance Redis queue
    const job = await getNextNotification();

    if (!job) {
      return NextResponse.json({ message: "No jobs in queue" });
    }

    // 2. Extract job parameters
    const { type, phone, email, data } = job;

    // 3. Process based on template type
    if (type && templates[type]) {
      const template = templates[type](data);
      
      // 4. Dispatch the resolved template content
      await notifyUser({
        phone,
        email,
        subject: template.subject,
        message: template.message,
        html: template.html,
        type
      });
    } else {
      // Fallback for manual or legacy notification formats
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
