'use server';

/**
 * @fileOverview An AI agent to generate invitation card designs based on event details and chosen color scheme.
 *
 * - generateInvitationCard - A function that handles the generation of invitation card designs.
 * - InvitationCardInput - The input type for the generateInvitationCard function.
 * - InvitationCardOutput - The return type for the generateInvitationCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvitationCardInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventDate: z.string().describe('The date of the event.'),
  eventTime: z.string().describe('The time of the event.'),
  eventVenue: z.string().describe('The venue of the event.'),
  primaryColor: z.string().describe('The primary color of the event (e.g., royal blue).'),
  secondaryColor: z.string().describe('The secondary color of the event (e.g., gold).'),
  eventDescription: z.string().describe('A brief description of the event.'),
  theme: z.string().describe('The theme of the event'),
  image: z
    .string()
    .describe(
      "Optional image for the invitation card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .optional(),
});
export type InvitationCardInput = z.infer<typeof InvitationCardInputSchema>;

const InvitationCardOutputSchema = z.object({
  invitationCardDesign: z
    .string()
    .describe('The generated invitation card design as a data URI (image).'),
});
export type InvitationCardOutput = z.infer<typeof InvitationCardOutputSchema>;

export async function generateInvitationCard(input: InvitationCardInput): Promise<InvitationCardOutput> {
  return invitationCardDesignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'invitationCardDesignPrompt',
  input: {schema: InvitationCardInputSchema},
  output: {schema: InvitationCardOutputSchema},
  prompt: `You are Eni, a world-class AI event manager with expertise in designing visually stunning invitation cards.

  Based on the event details and color scheme provided, create a unique and professional-looking invitation card design.
  Incorporate the event's theme into the design.
  If an image is provided, incorporate it into the design.
  The design should be visually appealing and reflect the elegance and sophistication of the event.

  Event Name: {{{eventName}}}
  Date: {{{eventDate}}}
  Time: {{{eventTime}}}
  Venue: {{{eventVenue}}}
  Primary Color: {{{primaryColor}}}
  Secondary Color: {{{secondaryColor}}}
  Description: {{{eventDescription}}}
  Theme: {{{theme}}}
  {{#if image}}
  Image: {{media url=image}}
  {{/if}}

  Please generate the invitation card design.
  The generated invitation card design should be returned as a data URI (image). Only return the data URI. Do not include any other explanation.
  `,
});

const invitationCardDesignFlow = ai.defineFlow(
  {
    name: 'invitationCardDesignFlow',
    inputSchema: InvitationCardInputSchema,
    outputSchema: InvitationCardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      invitationCardDesign: output!.invitationCardDesign,
    };
  }
);
