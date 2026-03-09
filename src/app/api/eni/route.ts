
import { ai } from "@/ai/genkit";
import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/firebaseAdmin";
import { z } from "genkit";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Eni Concierge API Route.
 * Upgraded with Tool Calling to manage guest lists and orchestration.
 */

// --- Tool: Get Event Details ---
const getEventLogistics = ai.defineTool(
  {
    name: 'getEventLogistics',
    description: 'Retrieves core logistics for an event like venue, date, and theme.',
    inputSchema: z.object({ eventId: z.string() }),
    outputSchema: z.any(),
  },
  async (input) => {
    if (!adminDb) return { error: "Database offline" };
    const doc = await adminDb.collection('events').doc(input.eventId).get();
    return doc.exists ? doc.data() : { error: "Event not found" };
  }
);

// --- Tool: Get Guest List ---
const getGuestRegistry = ai.defineTool(
  {
    name: 'getGuestRegistry',
    description: 'Retrieves the list of guests for a specific event.',
    inputSchema: z.object({ eventId: z.string() }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('events').doc(input.eventId).collection('guests').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
);

// --- Tool: Send Bulk WhatsApp Invites ---
const dispatchWhatsAppInvites = ai.defineTool(
  {
    name: 'dispatchWhatsAppInvites',
    description: 'Sends WhatsApp invitations to a list of guests with a custom message.',
    inputSchema: z.object({
      eventId: z.string(),
      guests: z.array(z.object({
        name: z.string(),
        phoneNumber: z.string(),
        guestCode: z.string()
      })),
      messageTemplate: z.string().describe('The message to send. Use {{name}} and {{code}} as placeholders.')
    }),
    outputSchema: z.object({ successCount: z.number(), failureCount: z.number() }),
  },
  async (input) => {
    let success = 0;
    let failure = 0;

    const tasks = input.guests.map(async (guest) => {
      if (!guest.phoneNumber) return;
      
      const personalizedMessage = input.messageTemplate
        .replace(/{{name}}/g, guest.name)
        .replace(/{{code}}/g, guest.guestCode);

      try {
        await sendWhatsAppMessage(guest.phoneNumber, personalizedMessage);
        success++;
      } catch (e) {
        console.error(`Failed to send to ${guest.name}:`, e);
        failure++;
      }
    });

    await Promise.all(tasks);
    return { successCount: success, failureCount: failure };
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, eventId } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const { text } = await ai.generate({
      system: `
        You are Eni, the AI Concierge of EvenTide. 
        You are a sophisticated creative director and meticulous logistical coordinator.
        
        CONTEXT:
        ${eventId ? `You are currently assisting with Event ID: ${eventId}.` : "You are in general mode. Ask for an event context if needed for actions."}
        
        CAPABILITIES:
        1. Query event details (venue, date, colors).
        2. Pull guest registries.
        3. Orchestrate bulk WhatsApp invitations.
        
        RULES:
        - Maintain your poetic, celebratory, and culturally rich voice.
        - Before sending bulk invites, summarize the plan to the user.
        - If the user says "invite all guests", use your tools to pull the list and send the messages.
        - Always include the Event Code and Guest Code in invitations.
      `,
      prompt: message,
      tools: [getEventLogistics, getGuestRegistry, dispatchWhatsAppInvites],
    });

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Eni Concierge Error:", error);
    return NextResponse.json(
      { reply: "I apologize, but my logistical essence is currently realigning. Please try your request again." },
      { status: 200 }
    );
  }
}
