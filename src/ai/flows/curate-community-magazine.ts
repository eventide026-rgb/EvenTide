'use server';
/**
 * @fileOverview An AI agent to curate and generate a community magazine issue.
 *
 * - curateCommunityMagazine - A function that generates a draft for the community magazine.
 * - MagazineCurationInput - The input type for the curation function.
 * - MagazineCurationOutput - The return type for the curation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EventSchema = z.object({
  name: z.string().describe('The name of the event.'),
  description: z.string().describe('A brief description of the event.'),
  eventDate: z.string().describe('The date of the event.'),
  eventType: z.string().describe('The type of event (e.g., Wedding, Conference).'),
});

const MagazineCurationInputSchema = z.object({
  events: z
    .array(EventSchema)
    .describe('A list of recent public events to be featured in the magazine.'),
});
export type MagazineCurationInput = z.infer<typeof MagazineCurationInputSchema>;

const MagazineCurationOutputSchema = z.object({
  title: z.string().describe("A creative, poetic title for this magazine issue."),
  introduction: z.string().describe("A warm, lyrical introduction from the Editor-in-Chief, 'Eni', setting the tone for the issue."),
  eventSummaries: z.array(z.object({
      eventName: z.string(),
      summary: z.string().describe("A celebratory, engaging summary of the event, capturing its essence and highlights."),
    })
  ),
  advertisement: z.object({
    concept: z.string().describe("A creative concept for an internal advertisement that fits the magazine's theme."),
    product: z.string().describe("The EvenTide product or feature being advertised (e.g., AI Invitation Designer, Vendor Marketplace)."),
  }),
});
export type MagazineCurationOutput = z.infer<typeof MagazineCurationOutputSchema>;

export async function curateCommunityMagazine(input: MagazineCurationInput): Promise<MagazineCurationOutput> {
  return curateCommunityMagazineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curateCommunityMagazinePrompt',
  input: { schema: MagazineCurationInputSchema },
  output: { schema: MagazineCurationOutputSchema },
  prompt: `You are Eni, the AI Editor-in-Chief of the EvenTide Community Magazine. Your voice is sophisticated, poetic, and celebratory.

Analyze the following recent public events from the EvenTide platform. Based on these events, generate a complete draft for the next magazine issue.

The issue should include:
1.  A creative, lyrical title for the issue that captures the overall theme of the events.
2.  A warm, personal introduction from you, Eni. Reflect on the beauty of community, connection, and celebration as seen in the events.
3.  A celebratory summary for EACH event provided. Make them engaging and highlight the joy of the occasion.
4.  A creative concept for an internal advertisement for an EvenTide feature. The ad should be elegant and fit the magazine's tone.

Events:
{{#each events}}
- Event Name: {{name}}
  - Description: {{description}}
  - Date: {{eventDate}}
  - Type: {{eventType}}
{{/each}}

Please generate the magazine draft in the requested JSON format.`,
});

const curateCommunityMagazineFlow = ai.defineFlow(
  {
    name: 'curateCommunityMagazineFlow',
    inputSchema: MagazineCurationInputSchema,
    outputSchema: MagazineCurationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
