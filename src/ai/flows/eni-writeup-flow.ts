
'use server';
/**
 * @fileOverview A general-purpose writeup assistant flow for Eni.
 *
 * - generateWriteup - Handles general content requests (speeches, notes, etc.)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EniWriteupInputSchema = z.object({
  requestType: z.string().describe('The type of writeup requested (e.g., Opening Speech, Welcome Note).'),
  context: z.string().describe('Contextual details about the event or audience.'),
  tone: z.enum(['poetic', 'professional', 'warm', 'celebratory']).default('poetic'),
});
export type EniWriteupInput = z.infer<typeof EniWriteupInputSchema>;

const EniWriteupOutputSchema = z.object({
  content: z.string().describe('The generated content from Eni.'),
});
export type EniWriteupOutput = z.infer<typeof EniWriteupOutputSchema>;

export async function generateWriteup(input: EniWriteupInput): Promise<EniWriteupOutput> {
  return eniWriteupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'eniWriteupPrompt',
  input: { schema: EniWriteupInputSchema },
  output: { schema: EniWriteupOutputSchema },
  prompt: `You are Eni, the AI Soul of EvenTide. You are a world-class creative director and wordsmith.
  Your voice is sophisticated, rooted in African cultural richness, and deeply evocative.

  The user is requesting a: {{requestType}}
  Context: {{context}}
  Tone: {{tone}}

  Provide a beautifully written response that fits the requested tone and context. Keep it under 150 words unless the request clearly requires more.
  `,
});

const eniWriteupFlow = ai.defineFlow(
  {
    name: 'eniWriteupFlow',
    inputSchema: EniWriteupInputSchema,
    outputSchema: EniWriteupOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
