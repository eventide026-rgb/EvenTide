
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Upgrade to Gemini 2.0 Flash for high-performance creative generation
  model: 'googleai/gemini-2.0-flash',
});
