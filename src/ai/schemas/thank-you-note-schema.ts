
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
