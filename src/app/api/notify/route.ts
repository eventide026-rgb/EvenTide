
import { addNotificationToQueue } from "@/lib/notificationQueue";
import { NextResponse } from "next/server";

/**
 * @fileOverview High-Fidelity Unified Notification API (Queued).
 * Instead of processing delivery immediately, we queue the intent.
 * This ensures the API is non-blocking and highly responsive.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Basic Validation
    if (!body.type) {
      return NextResponse.json(
        { error: "Notification 'type' is required for queueing." },
        { status: 400 }
      );
    }

    // 2. Queue the notification for background processing
    await addNotificationToQueue(body);

    return NextResponse.json({
      success: true,
      message: "Notification successfully queued for delivery.",
    });

  } catch (error: any) {
    console.error("API Route Error [notify-queue]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
