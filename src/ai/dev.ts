
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-welcome-message.ts';
import '@/ai/flows/invitation-card-design.ts';
import '@/ai/flows/curate-community-magazine.ts';
import '@/ai/flows/generate-program-suggestions.ts';
import '@/ai/flows/generate-menu-suggestions.ts';
