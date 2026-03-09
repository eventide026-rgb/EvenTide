import { ai } from "@/ai/genkit";
import { NextResponse } from "next/server";

/**
 * @fileOverview Eni Brain API Route.
 * This endpoint serves as the central intelligence hub for the Eni assistant.
 * It uses Genkit to process user messages and generate brand-aligned, poetic responses.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

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
      { error: "Eni is currently contemplating new masterpieces. Please try again in a moment." },
      { status: 500 }
    );
  }
}
