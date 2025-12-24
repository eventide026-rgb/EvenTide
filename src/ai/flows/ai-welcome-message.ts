'use server';

/**
 * @fileOverview This file defines the AI welcome message flow for the EvenTide application.
 *
 * It generates a personalized welcome message for guests accessing their event dashboard, enhancing user engagement.
 *
 * - `generateWelcomeMessage`:  Generates a welcome message from Eni.
 * - `WelcomeMessageInput`: Input type for the welcome message.
 * - `WelcomeMessageOutput`: Output type for the welcome message.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WelcomeMessageInputSchema = z.object({
  guestName: z.string().describe('The name of the guest receiving the welcome message.'),
  eventName: z.string().describe('The name of the event the guest is attending.'),
});
export type WelcomeMessageInput = z.infer<typeof WelcomeMessageInputSchema>;

const WelcomeMessageOutputSchema = z.object({
  message: z.string().describe('The personalized welcome message for the guest.'),
});
export type WelcomeMessageOutput = z.infer<typeof WelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input: WelcomeMessageInput): Promise<WelcomeMessageOutput> {
  return aiWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWelcomeMessagePrompt',
  input: {schema: WelcomeMessageInputSchema},
  output: {schema: WelcomeMessageOutputSchema},
  prompt: `You are Eni, a super intelligent event manager with world-class experience. You are welcoming a guest to an event.

  Create a personalized welcome message for {{guestName}} who is attending {{eventName}}. The message should be warm, inviting, and provide a brief overview of what they can expect on their dashboard. Make the message less than 50 words.
  `,
});

const aiWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'aiWelcomeMessageFlow',
    inputSchema: WelcomeMessageInputSchema,
    outputSchema: WelcomeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
