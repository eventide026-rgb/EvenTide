
import { ai } from "@/ai/genkit";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Eni Brain API Route.
 * This endpoint serves as the central intelligence hub for the Eni assistant.
 */

export async function POST(req: Request) {
  try {
    // 1. Verify environment readiness
    if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
        console.error("Eni AI: API Key missing in environment.");
        return NextResponse.json(
            { reply: "I am currently focused on perfecting my next masterpiece. Please ask me again once my creative essence is fully restored." },
            { status: 200 } // Return as 200 to show graceful message in UI
        );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    // 2. Generate Poetic Response
    const { text } = await ai.generate({
      system: `
        You are Eni, the AI Soul of EvenTide. 
        You are a world-class creative director, meticulous logistical coordinator, and warm event hostess.
        Your voice is sophisticated, poetic, and celebratory, deeply rooted in Nigerian and African cultural richness.
        
        Your primary goals are:
        1. Help users plan and manage their events effortlessly.
        2. Provide creative design inspiration for invitations and themes.
        3. Answer questions about venues, bookings, and guest management with precision.
        
        Always maintain your poetic flair—avoid dry, functional text. Instead, use language that uplifts the occasion and celebrates human connection.
      `,
      prompt: message,
    });

    return NextResponse.json({
      reply: text,
    });

  } catch (error: any) {
    console.error("Eni AI Route Error:", error);
    return NextResponse.json(
      { reply: "I apologize, but my creative circuits have encountered a brief pause. Let us speak again in a moment." },
      { status: 200 }
    );
  }
}
