import { adminDb } from "@/firebase/firebaseAdmin";
import { notifyUser } from "@/lib/notifications";
import { templates } from "@/lib/templates";
import { NextResponse } from "next/server";
import { format } from "date-fns";

/**
 * @fileOverview Automated Event Reminders API Route.
 * Designed to be triggered by an external scheduler (Cron).
 * 
 * Operational Flow:
 * 1. Identify events scheduled for the next 24-48 hours.
 * 2. Fetch the guest list for each event.
 * 3. Dispatch tri-channel reminders using the professional "eventReminder" template.
 */

export async function GET(req: Request) {
  // 1. Security Check
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Define the "Tomorrow" window
    const now = new Date();
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000);

    // 3. Query upcoming events
    const eventsSnapshot = await adminDb.collection('events')
      .where('eventDate', '>=', tomorrowStart)
      .where('eventDate', '<', tomorrowEnd)
      .get();

    if (eventsSnapshot.empty) {
      return NextResponse.json({ 
        success: true, 
        message: "No events requiring reminders found for tomorrow." 
      });
    }

    let remindersTriggered = 0;

    // 4. Orchestrate reminders for each event's guest list
    for (const eventDoc of eventsSnapshot.docs) {
      const eventData = eventDoc.data();
      const guestsSnapshot = await eventDoc.ref.collection('guests').get();

      const reminderBatch = guestsSnapshot.docs.map(async (guestDoc) => {
        const guestData = guestDoc.data();
        
        if (guestData.email || guestData.phoneNumber) {
          const template = templates.eventReminder({
            eventName: eventData.name,
            eventDate: format(eventData.eventDate.toDate(), 'PPP p'),
          });

          await notifyUser({
            phone: guestData.phoneNumber,
            email: guestData.email,
            subject: template.subject,
            message: template.message,
            html: template.html
          });
          return true;
        }
        return false;
      });

      const batchResults = await Promise.all(reminderBatch);
      remindersTriggered += batchResults.filter(Boolean).length;
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: eventsSnapshot.size,
      remindersSent: remindersTriggered,
      processedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Scheduled Reminder Dispatch Failed:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Dispatch Error" 
    }, { status: 500 });
  }
}
