
'use server';
/**
 * @fileOverview An AI agent to generate a personalized thank-you note from a guest to a host.
 *
 * - generateThankYouNote - A function that generates a thank-you note draft.
 * - ThankYouNoteInput - The input type for the function.
 * - ThankYouNoteOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ThankYouNoteInputSchema = z.object({
  guestName: z.string().describe('The name of the guest sending the note.'),
  eventName: z.string().describe('The name of the event they attended.'),
  eventType: z.string().describe('The type of event (e.g., Wedding, Birthday).'),
});
export type ThankYouNoteInput = z.infer<typeof ThankYouNoteInputSchema>;

export const ThankYouNoteOutputSchema = z.object({
  note: z.string().describe('The generated thank-you note text.'),
});
export type ThankYouNoteOutput = z.infer<typeof ThankYouNoteOutputSchema>;

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
