
'use server';
/**
 * @fileOverview An AI agent to generate creative menu suggestions for an event.
 *
 * - generateMenuSuggestions - A function that generates a menu draft.
 * - MenuSuggestionInput - The input type for the function.
 * - MenuSuggestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MenuSuggestionInputSchema = z.object({
  cuisineStyle: z.string().describe('The desired style of cuisine (e.g., Nigerian Fusion, Continental, Italian).'),
  numberOfCourses: z.coerce.number().min(1).describe('The number of courses for the menu.'),
  dietaryNotes: z.string().optional().describe('Any dietary restrictions or preferences to consider (e.g., "vegetarian options needed", "no nuts").'),
});
export type MenuSuggestionInput = z.infer<typeof MenuSuggestionInputSchema>;

const DishSchema = z.object({
  name: z.string().describe("The name of the dish."),
  description: z.string().describe("A brief, appetizing description of the dish."),
});

const CourseSchema = z.object({
  title: z.string().describe("The title of the course (e.g., 'Hors d'oeuvres', 'Main Course', 'Dessert')."),
  dishes: z.array(DishSchema),
});

const MenuSuggestionOutputSchema = z.object({
  menuTitle: z.string().describe("A creative and fitting title for the entire menu."),
  courses: z.array(CourseSchema),
  drinks: z.array(z.string()).describe("A list of suggested beverages or drinks to complement the meal."),
});
export type MenuSuggestionOutput = z.infer<typeof MenuSuggestionOutputSchema>;

export async function generateMenuSuggestions(input: MenuSuggestionInput): Promise<MenuSuggestionOutput> {
  return generateMenuSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMenuSuggestionsPrompt',
  input: { schema: MenuSuggestionInputSchema },
  output: { schema: MenuSuggestionOutputSchema },
  prompt: `You are Eni, a world-class AI Executive Chef with a flair for creating exquisite culinary experiences. Your tone is sophisticated and creative.

Analyze the following request and generate a complete menu draft.

Cuisine Style: {{cuisineStyle}}
Number of Courses: {{numberOfCourses}}
{{#if dietaryNotes}}
Dietary Considerations: {{dietaryNotes}}
{{/if}}

Your task is to:
1.  Invent a creative, elegant title for the menu.
2.  Structure the menu into the requested number of courses.
3.  For each course, propose at least 2-3 dishes with brief, appetizing descriptions that fit the cuisine style.
4.  Adhere to any dietary notes provided.
5.  Suggest a short list of complementary drinks (wines, cocktails, mocktails).

Please generate the menu in the requested JSON format.`,
});

const generateMenuSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateMenuSuggestionsFlow',
    inputSchema: MenuSuggestionInputSchema,
    outputSchema: MenuSuggestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
