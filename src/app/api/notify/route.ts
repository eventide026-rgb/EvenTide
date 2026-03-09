
import { addNotificationToQueue } from "@/lib/notificationQueue";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * @fileOverview High-Fidelity Unified Notification API (Queued).
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.type) {
      return NextResponse.json(
        { error: "Notification 'type' is required for queueing." },
        { status: 400 }
      );
    }

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
