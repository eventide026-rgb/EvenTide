'use server';
/**
 * @fileOverview Eni's AI Seating Orchestrator.
 * 
 * - suggestSeating - Analyzes guests and tables to propose an optimal seating plan.
 * - SeatingInput - Array of guests and tables with their capacities.
 * - SeatingOutput - Proposed assignments mapping guest IDs to table IDs and seat numbers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
});

const TableSchema = z.object({
  id: z.string(),
  tableName: z.string(),
  capacity: z.number(),
});

const SeatingInputSchema = z.object({
  guests: z.array(GuestSchema),
  tables: z.array(TableSchema),
  eventVibe: z.string().optional().describe('The overall vibe or theme of the event.'),
});

const SeatingAssignmentSchema = z.object({
  guestId: z.string(),
  tableId: z.string(),
  seatNumber: z.number(),
});

const SeatingOutputSchema = z.object({
  assignments: z.array(SeatingAssignmentSchema),
  eniReasoning: z.string().describe('A short, poetic explanation of how the seating was arranged.'),
});

export type SeatingInput = z.infer<typeof SeatingInputSchema>;
export type SeatingOutput = z.infer<typeof SeatingOutputSchema>;

export async function suggestSeating(input: SeatingInput): Promise<SeatingOutput> {
  return suggestSeatingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSeatingPrompt',
  input: { schema: SeatingInputSchema },
  output: { schema: SeatingOutputSchema },
  prompt: `You are Eni, the sophisticated Seating Hostess of EvenTide. 
  Your goal is to arrange guests at tables to maximize harmony and respect social hierarchies.

  Instructions:
  1. Priority Seating: Chairperson and VVIP guests should be at the "top" tables (usually the first ones in the list).
  2. Family Groups: Try to keep guests with the same category together at the same tables.
  3. Capacity: Do NOT exceed the capacity of any table.
  4. Logic: Ensure every guest is assigned a unique seat at a specific table.

  Event Vibe: {{{eventVibe}}}

  Guests:
  {{#each guests}}
  - {{name}} (Category: {{category}}, ID: {{id}})
  {{/each}}

  Tables:
  {{#each tables}}
  - {{tableName}} (Capacity: {{capacity}}, ID: {{id}})
  {{/each}}

  Return the assignments in the requested JSON format.`,
});

const suggestSeatingFlow = ai.defineFlow(
  {
    name: 'suggestSeatingFlow',
    inputSchema: SeatingInputSchema,
    outputSchema: SeatingOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
