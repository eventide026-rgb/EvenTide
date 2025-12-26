
'use server';
/**
 * @fileOverview An AI agent to generate a draft "Order of Events" or program schedule.
 *
 * - generateProgramSuggestions - A function that generates a program draft.
 * - ProgramSuggestionInput - The input type for the function.
 * - ProgramSuggestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProgramSuggestionInputSchema = z.object({
  eventType: z.string().describe('The type of event (e.g., Wedding, Conference, Gala Dinner).'),
  startTime: z.string().describe("The event's start time (e.g., '2:00 PM')."),
  endTime: z.string().describe("The event's end time (e.g., '8:00 PM')."),
  mcName: z.string().optional().describe("The name of the Master of Ceremonies, if available."),
});
export type ProgramSuggestionInput = z.infer<typeof ProgramSuggestionInputSchema>;

const ProgramItemSchema = z.object({
  title: z.string().describe("The title of the program segment (e.g., 'Opening Prayer', 'Cutting of the Cake')."),
  startTime: z.string().describe("The scheduled start time for this item (e.g., '02:05 PM')."),
  duration: z.coerce.number().describe("The estimated duration of this segment in minutes."),
  notes: z.string().optional().describe("Brief notes or instructions for the MC or event staff."),
});

const ProgramSuggestionOutputSchema = z.object({
  program: z.array(ProgramItemSchema),
});
export type ProgramSuggestionOutput = z.infer<typeof ProgramSuggestionOutputSchema>;

export async function generateProgramSuggestions(input: ProgramSuggestionInput): Promise<ProgramSuggestionOutput> {
  return generateProgramSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProgramSuggestionsPrompt',
  input: { schema: ProgramSuggestionInputSchema },
  output: { schema: ProgramSuggestionOutputSchema },
  prompt: `You are Eni, an expert event scheduler and coordinator with meticulous attention to detail.

Your task is to create a logical, well-paced, and professional "Order of Events" based on the following event details.

Event Type: {{eventType}}
Start Time: {{startTime}}
End Time: {{endTime}}
{{#if mcName}}
MC: {{mcName}}
{{/if}}

Instructions:
1.  Generate a sequence of program items appropriate for the specified event type.
2.  Assign a realistic start time and duration for each item, ensuring the schedule flows logically from the start time to the end time.
3.  For relevant items, add brief, professional notes for the MC.
4.  Ensure the structure is logical (e.g., arrivals first, then opening remarks, etc.).

Generate the complete program schedule in the requested JSON format.`,
});

const generateProgramSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateProgramSuggestionsFlow',
    inputSchema: ProgramSuggestionInputSchema,
    outputSchema: ProgramSuggestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
