
'use server';
/**
 * @fileOverview An AI agent to generate creative suggestions for an event mood board.
 *
 * - suggestMoodboardItems - A function that suggests new items for a mood board.
 * - MoodboardSuggestionInput - The input type for the function.
 * - MoodboardSuggestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MoodboardItemSchema = z.object({
  type: z.enum(['image', 'color', 'note']),
  value: z.string(),
});

const MoodboardSuggestionInputSchema = z.object({
  eventTheme: z.string().describe('The overall theme of the event (e.g., "Rustic Elegance", "Modern Tropical").'),
  currentItems: z.array(MoodboardItemSchema).describe('An array of items already on the mood board.'),
});
export type MoodboardSuggestionInput = z.infer<typeof MoodboardSuggestionInputSchema>;

const SuggestedItemSchema = z.object({
    type: z.enum(['image', 'color', 'note']),
    value: z.string().describe("The suggested item's value. For an image, this is a descriptive prompt for an image generator (e.g., 'A close-up of dark khaki linen fabric'). For a color, a hex code. For a note, the text."),
    reason: z.string().describe("A brief, creative reason explaining why this item was suggested."),
});

const MoodboardSuggestionOutputSchema = z.object({
  suggestions: z.array(SuggestedItemSchema),
});
export type MoodboardSuggestionOutput = z.infer<typeof MoodboardSuggestionOutputSchema>;

export async function suggestMoodboardItems(input: MoodboardSuggestionInput): Promise<MoodboardSuggestionOutput> {
  return suggestMoodboardItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMoodboardItemsPrompt',
  input: { schema: MoodboardSuggestionInputSchema },
  output: { schema: MoodboardSuggestionOutputSchema },
  prompt: `You are Eni, an expert AI Creative Director with a sophisticated eye for design and aesthetics.

Your task is to analyze an existing event mood board and provide 3-4 new, complementary suggestions to enhance it.

The event's theme is: {{eventTheme}}

The current mood board consists of:
{{#each currentItems}}
- A {{type}} with the value: "{{value}}"
{{/each}}

Instructions:
1.  Analyze the current items to understand the established visual direction.
2.  Generate 3-4 new suggestions (a mix of images, colors, and notes) that complement and elevate the existing mood board.
3.  For each suggestion, provide a brief, insightful reason explaining why it fits the theme.
4.  For image suggestions, provide a descriptive text prompt that an image generation model could use (e.g., "A centerpiece with white orchids and dark green monstera leaves"). Do not provide URLs.
5.  Return your suggestions in the requested JSON format.`,
});

const suggestMoodboardItemsFlow = ai.defineFlow(
  {
    name: 'suggestMoodboardItemsFlow',
    inputSchema: MoodboardSuggestionInputSchema,
    outputSchema: MoodboardSuggestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
