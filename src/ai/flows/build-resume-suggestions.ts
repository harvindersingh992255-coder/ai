'use server';

/**
 * @fileOverview An AI flow for generating resume content suggestions.
 *
 * - buildResumeSuggestions - A function that generates suggestions for resume sections.
 * - BuildResumeSuggestionsInput - The input type for the buildResumeSuggestions function.
 * - BuildResumeSuggestionsOutput - The return type for the buildResumeSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BuildResumeSuggestionsInputSchema = z.object({
  jobRole: z.string().describe('The job role for which to generate suggestions.'),
  company: z.string().optional().describe('The company where the role was held.'),
  responsibilities: z.string().describe('A brief description of the user\'s responsibilities in the role.'),
  numSuggestions: z.number().default(3).describe('The number of bullet point suggestions to generate.'),
});
export type BuildResumeSuggestionsInput = z.infer<typeof BuildResumeSuggestionsInputSchema>;

const BuildResumeSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of generated resume bullet points.'),
});
export type BuildResumeSuggestionsOutput = z.infer<typeof BuildResumeSuggestionsOutputSchema>;

export async function buildResumeSuggestions(input: BuildResumeSuggestionsInput): Promise<BuildResumeSuggestionsOutput> {
  return buildResumeSuggestionsFlow(input);
}

const buildResumeSuggestionsPrompt = ai.definePrompt({
  name: 'buildResumeSuggestionsPrompt',
  input: { schema: BuildResumeSuggestionsInputSchema },
  output: { schema: BuildResumeSuggestionsOutputSchema },
  prompt: `You are an expert resume writer. Your task is to transform a simple description of job responsibilities into powerful, quantified, and impactful resume bullet points.

**Candidate's Role:**
- **Job Role:** {{{jobRole}}}
{{#if company}}
- **Company:** {{{company}}}
{{/if}}
- **Responsibilities:** {{{responsibilities}}}

**Your Task:**
Generate {{{numSuggestions}}} impactful resume bullet points based on the provided responsibilities. Use the STAR method (Situation, Task, Action, Result) as a framework. Start each bullet point with a strong action verb. Quantify achievements wherever possible (e.g., "Increased sales by 15%", "Reduced server costs by $5K/month", "Managed a team of 5 engineers").

Return the suggestions as an array of strings in the output JSON.
`,
});

const buildResumeSuggestionsFlow = ai.defineFlow(
  {
    name: 'buildResumeSuggestionsFlow',
    inputSchema: BuildResumeSuggestionsInputSchema,
    outputSchema: BuildResumeSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await buildResumeSuggestionsPrompt(input);
    return output!;
  }
);
