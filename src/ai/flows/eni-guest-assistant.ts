'use server';
/**
 * @fileOverview Eni AI Guest Assistant.
 * 
 * This flow uses Tool Calling to allow Eni to answer guest questions
 * by querying real-time event data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/firebase/firebaseAdmin';

// --- Tool: Get Seating Info ---
const getSeatingInfo = ai.defineTool(
  {
    name: 'getSeatingInfo',
    description: 'Retrieves the table name and seat number for a specific guest.',
    inputSchema: z.object({
      eventId: z.string(),
      guestId: z.string(),
    }),
    outputSchema: z.object({
      tableName: z.string(),
      seatNumber: z.number().optional(),
      message: z.string(),
    }),
  },
  async (input) => {
    if (!adminDb) {
      return { tableName: 'Unknown', message: 'The seating information system is currently offline.' };
    }

    try {
      const seatsSnap = await adminDb
        .collection('events')
        .doc(input.eventId)
        .collection('seats')
        .where('guestId', '==', input.guestId)
        .limit(1)
        .get();

      if (seatsSnap.empty) {
        return { tableName: 'Unassigned', message: 'The seating plan is still being finalized.' };
      }

      const seatData = seatsSnap.docs[0].data();
      const tableSnap = await adminDb
        .collection('events')
        .doc(input.eventId)
        .collection('tables')
        .doc(seatData.tableId)
        .get();

      return {
        tableName: tableSnap.exists ? tableSnap.data()?.tableName : 'Unknown Table',
        seatNumber: seatData.seatNumber,
        message: 'Found the assignment.',
      };
    } catch (error) {
      console.error("Tool Error [getSeatingInfo]:", error);
      return { tableName: 'Unknown', message: 'I encountered an error while searching for your seat.' };
    }
  }
);

// --- Tool: Get Event Menu ---
const getEventMenu = ai.defineTool(
  {
    name: 'getEventMenu',
    description: 'Retrieves the multi-course menu for the event.',
    inputSchema: z.object({
      eventId: z.string(),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    if (!adminDb) {
      return { message: 'The culinary details are temporarily unavailable.' };
    }

    try {
      const menuSnap = await adminDb
        .collection('events')
        .doc(input.eventId)
        .collection('menu')
        .doc('main')
        .get();

      return menuSnap.exists ? menuSnap.data() : { message: 'The culinary plan is still a surprise.' };
    } catch (error) {
      return { message: 'I could not retrieve the menu at this time.' };
    }
  }
);

// --- Tool: Get Event Program ---
const getEventProgram = ai.defineTool(
  {
    name: 'getEventProgram',
    description: 'Retrieves the scheduled order of events.',
    inputSchema: z.object({
      eventId: z.string(),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    if (!adminDb) {
      return { message: 'The schedule is currently being realigned.' };
    }

    try {
      const programSnap = await adminDb
        .collection('events')
        .doc(input.eventId)
        .collection('program')
        .doc('main')
        .get();

      return programSnap.exists ? programSnap.data() : { message: 'The schedule is still being tuned for perfection.' };
    } catch (error) {
      return { message: 'The event program could not be fetched.' };
    }
  }
);

// --- Main Flow ---
const GuestAssistantInputSchema = z.object({
  eventId: z.string(),
  guestId: z.string(),
  guestName: z.string(),
  question: z.string(),
});

const GuestAssistantOutputSchema = z.object({
  answer: z.string().describe('The helpful and poetic response from Eni.'),
});

export async function askEniAssistant(input: z.infer<typeof GuestAssistantInputSchema>) {
  return eniAssistantFlow(input);
}

const eniAssistantFlow = ai.defineFlow(
  {
    name: 'eniAssistantFlow',
    inputSchema: GuestAssistantInputSchema,
    outputSchema: GuestAssistantOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      system: `You are Eni, the AI Soul of EvenTide. You are a world-class creative director and warm event hostess.
      Your voice is sophisticated, poetic, and celebratory.
      
      You are currently assisting ${input.guestName} at an event.
      Use the provided tools to find specific information about their seating, the menu, or the program.
      
      If a guest asks about something you cannot find with tools, apologize gracefully and suggest they contact the event staff.
      Never make up information. Stay in character—be lyrical and warm.`,
      prompt: input.question,
      tools: [getSeatingInfo, getEventMenu, getEventProgram],
      config: {
          temperature: 0.7,
      }
    });

    return { answer: text };
  }
);
