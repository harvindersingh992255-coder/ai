'use server';

/**
 * @fileOverview A flow for analyzing body language from a video.
 *
 * - analyzeBodyLanguage - A function that analyzes body language.
 * - AnalyzeBodyLanguageInput - The input type for the analyzeBodyLanguage function.
 * - AnalyzeBodyLanguageOutput - The return type for the analyzeBodyLanguage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeBodyLanguageInputSchema = z.object({
  videoDataUri: z.string().describe("A short video of a person answering an interview question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  question: z.string().describe('The interview question that was asked.'),
});
export type AnalyzeBodyLanguageInput = z.infer<typeof AnalyzeBodyLanguageInputSchema>;


const AnalyzeBodyLanguageOutputSchema = z.object({
  confidenceScore: z.number().min(0).max(100).describe('A score from 0 to 100 representing the candidate\'s perceived confidence.'),
  confidenceFeedback: z.string().describe('Specific feedback on why the confidence score was given, with examples.'),
  postureScore: z.number().min(0).max(100).describe('A score from 0 to 100 for the candidate\'s posture.'),
  postureFeedback: z.string().describe('Feedback on body posture, noting any slouching, fidgeting, or positive gestures.'),
  eyeContactScore: z.number().min(0).max(100).describe('A score from 0 to 100 for eye contact.'),
  eyeContactFeedback: z.string().describe('Feedback on eye contact, mentioning if it was steady and engaging or if the user was looking away frequently.'),
  overallAnalysis: z.string().describe('A summary of the body language analysis and recommendations for improvement.'),
});
export type AnalyzeBodyLanguageOutput = z.infer<typeof AnalyzeBodyLanguageOutputSchema>;


export async function analyzeBodyLanguage(input: AnalyzeBodyLanguageInput): Promise<AnalyzeBodyLanguageOutput> {
  return analyzeBodyLanguageFlow(input);
}

const analyzeBodyLanguagePrompt = ai.definePrompt({
  name: 'analyzeBodyLanguagePrompt',
  input: { schema: AnalyzeBodyLanguageInputSchema },
  output: { schema: AnalyzeBodyLanguageOutputSchema },
  prompt: `You are an expert communication coach specializing in non-verbal cues for job interviews. Analyze the provided video of a candidate answering an interview question.

The question was: "{{question}}"

Analyze the video: {{media url=videoDataUri}}

Based on the candidate's body language, evaluate their confidence, posture, and eye contact. Provide a score from 0-100 for each, specific feedback with examples, and an overall analysis with actionable recommendations. Focus ONLY on non-verbal cues. Do not analyze the content of their spoken answer.
`,
});

const analyzeBodyLanguageFlow = ai.defineFlow(
  {
    name: 'analyzeBodyLanguageFlow',
    inputSchema: AnalyzeBodyLanguageInputSchema,
    outputSchema: AnalyzeBodyLanguageOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeBodyLanguagePrompt(input);
    return output!;
  }
);
