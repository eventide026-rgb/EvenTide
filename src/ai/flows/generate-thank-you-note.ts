
'use server';
/**
 * @fileOverview An AI agent to generate a personalized thank-you note from a guest to a host.
 *
 * - generateThankYouNote - A function that generates a thank-you note draft.
 */

import { ai } from '@/ai/genkit';
import { 
  ThankYouNoteInputSchema, 
  ThankYouNoteOutputSchema,
  type ThankYouNoteInput,
  type ThankYouNoteOutput,
} from '@/ai/schemas/thank-you-note-schema';


export async function generateThankYouNote(input: ThankYouNoteInput): Promise<ThankYouNoteOutput> {
  return generateThankYouNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThankYouNotePrompt',
  input: { schema: ThankYouNoteInputSchema },
  output: { schema: ThankYouNoteOutputSchema },
  prompt: `You are Eni, a warm and articulate AI assistant.

Your task is to write a short, heartfelt, and personal-sounding thank-you note from a guest to the event host. The tone should be grateful and celebratory.

Guest Name: {{guestName}}
Event Name: {{eventName}}
Event Type: {{eventType}}

Instructions:
1.  Address the host warmly (e.g., "Dear Host,").
2.  Mention the specific event by name.
3.  Express gratitude for being invited and for the wonderful time the guest had.
4.  Keep the note concise (around 50-70 words).
5.  Sign off with the guest's name.

Generate the note in the requested JSON format.`,
});

const generateThankYouNoteFlow = ai.defineFlow(
  {
    name: 'generateThankYouNoteFlow',
    inputSchema: ThankYouNoteInputSchema,
    outputSchema: ThankYouNoteOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
