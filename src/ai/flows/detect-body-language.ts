'use server';

/**
 * @fileOverview Flow for analyzing user body language and eye contact during interviews.
 *
 * - detectBodyLanguage - Analyzes user video and provides feedback on body language and eye contact.
 * - DetectBodyLanguageInput - The input type for the detectBodyLanguage function.
 * - DetectBodyLanguageOutput - The return type for the detectBodyLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectBodyLanguageInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of the user during an interview, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectBodyLanguageInput = z.infer<typeof DetectBodyLanguageInputSchema>;

const DetectBodyLanguageOutputSchema = z.object({
  bodyLanguageFeedback: z
    .string()
    .describe('AI-generated feedback on the user\'s body language.'),
  eyeContactFeedback: z
    .string()
    .describe('AI-generated feedback on the user\'s eye contact.'),
});
export type DetectBodyLanguageOutput = z.infer<typeof DetectBodyLanguageOutputSchema>;

export async function detectBodyLanguage(
  input: DetectBodyLanguageInput
): Promise<DetectBodyLanguageOutput> {
  return detectBodyLanguageFlow(input);
}

const detectBodyLanguagePrompt = ai.definePrompt({
  name: 'detectBodyLanguagePrompt',
  input: {schema: DetectBodyLanguageInputSchema},
  output: {schema: DetectBodyLanguageOutputSchema},
  prompt: `You are an expert interview coach, providing feedback on body language and eye contact.

  Analyze the user's video and provide specific, actionable feedback on their body language and eye contact.

  Video: {{media url=videoDataUri}}

  Focus on aspects like posture, gestures, facial expressions, and consistency of eye contact.  Provide separate feedback for body language and eye contact.
  `,
});

const detectBodyLanguageFlow = ai.defineFlow(
  {
    name: 'detectBodyLanguageFlow',
    inputSchema: DetectBodyLanguageInputSchema,
    outputSchema: DetectBodyLanguageOutputSchema,
  },
  async input => {
    const {output} = await detectBodyLanguagePrompt(input);
    return output!;
  }
);
