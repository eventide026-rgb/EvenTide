'use server';
/**
 * @fileOverview An AI agent to curate a photo gallery for an event.
 *
 * - curateGalleryPage - A function that generates a themed gallery from a collection of images.
 * - GalleryCurationInput - The input type for the curation function.
 * - GalleryCurationOutput - The return type for the curation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GalleryCurationInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventType: z.string().describe('The type of event (e.g., Wedding, Conference).'),
  imageUrls: z.array(z.string().url()).describe('An array of URLs for all available photos.'),
});
export type GalleryCurationInput = z.infer<typeof GalleryCurationInputSchema>;

const GalleryCurationOutputSchema = z.object({
  title: z.string().describe("A creative, evocative title for the curated gallery (e.g., 'Moments of Joy', 'The Vows')."),
  selectedImageUrls: z.array(z.string().url()).describe("An array of 5 to 9 image URLs that best represent the identified theme."),
});
export type GalleryCurationOutput = z.infer<typeof GalleryCurationOutputSchema>;

export async function curateGalleryPage(input: GalleryCurationInput): Promise<GalleryCurationOutput> {
  return curateGalleryPageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curateGalleryPagePrompt',
  input: { schema: GalleryCurationInputSchema },
  output: { schema: GalleryCurationOutputSchema },
  prompt: `You are Eni, an expert photo editor and storyteller with a keen eye for emotion and composition.

Your task is to analyze a collection of photos from an event and curate a small, powerful gallery from them.

Event Name: {{eventName}}
Event Type: {{eventType}}
All available photos are provided below.

Instructions:
1.  Analyze all the images to understand the story and feeling of the event.
2.  Identify a single, compelling micro-theme or narrative within the photos (e.g., "The Vows and Rings", "Candid Laughter", "Decor & Ambiance", "Dance Floor Energy").
3.  Select the best 5 to 9 photos that are most visually striking and best represent this single theme. The selection should be tight and focused.
4.  Create a creative, short, and evocative title for this curated gallery based on the theme you identified.
5.  Return ONLY the title and the URLs of your selected images.

{{#each imageUrls}}
- Photo: {{media url=this}}
{{/each}}

Generate the curated gallery in the requested JSON format.`,
});

const curateGalleryPageFlow = ai.defineFlow(
  {
    name: 'curateGalleryPageFlow',
    inputSchema: GalleryCurationInputSchema,
    outputSchema: GalleryCurationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
