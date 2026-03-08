
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-welcome-message.ts';
import '@/ai/flows/invitation-card-design.ts';
import '@/ai/flows/curate-community-magazine.ts';
import '@/ai/flows/generate-program-suggestions.ts';
import '@/ai/flows/generate-menu-suggestions.ts';
import '@/ai/flows/curate-gallery-page.ts';
import '@/ai/flows/suggest-moodboard-items.ts';
import '@/ai/flows/generate-thank-you-note.ts';
import '@/ai/flows/eni-writeup-flow.ts';
