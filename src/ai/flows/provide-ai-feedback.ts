'use server';

/**
 * @fileOverview AI feedback flow for interview answers.
 *
 * - provideAiFeedback - A function that provides AI-generated feedback on interview answers.
 * - ProvideAiFeedbackInput - The input type for the provideAiFeedback function.
 * - ProvideAiFeedbackOutput - The return type for the provideAiFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAiFeedbackInputSchema = z.object({
  dreamCompany: z.string().describe('The dream company for which the interview is being conducted.'),
  industry: z.string().describe('The industry of the company.'),
  jobRole: z.string().describe('The target job role for the user.'),
  question: z.string().describe('The interview question asked.'),
  answer: z.string().describe("The user's answer to the interview question."),
  bodyLanguageAnalysis: z.string().optional().describe('An AI-generated analysis of the candidate\'s body language during the answer.'),
});
export type ProvideAiFeedbackInput = z.infer<typeof ProvideAiFeedbackInputSchema>;

const ProvideAiFeedbackOutputSchema = z.object({
  overallScore: z.number().describe('An overall score for the answer, out of 100.'),
  clarityAndConciseness: z.object({
    score: z.number().describe('Score from 0 to 100 for clarity and conciseness.'),
    feedback: z.string().describe('Feedback on the clarity and conciseness of the answer.'),
  }),
  contentRelevance: z.object({
    score: z.number().describe('Score from 0 to 100 for content relevance.'),
    feedback: z.string().describe('Feedback on how relevant the answer was to the question and the job role.'),
  }),
  starMethodUsage: z.object({
    score: z.number().describe('Score from 0 to 100 for STAR method usage (Situation, Task, Action, Result).'),
    feedback: z.string().describe('Feedback on the application of the STAR method. If not applicable, state that.'),
  }),
  impactAndResults: z.object({
    score: z.number().describe('Score from 0 to 100 for demonstrating impact and results.'),
    feedback: z.string().describe('Feedback on how well the candidate highlighted the impact and results of their actions.'),
  }),
  recommendations: z.string().describe('A summary of overall strengths, weaknesses, and actionable recommendations for improvement, considering both verbal answer and body language.'),
});
export type ProvideAiFeedbackOutput = z.infer<typeof ProvideAiFeedbackOutputSchema>;

export async function provideAiFeedback(input: ProvideAiFeedbackInput): Promise<ProvideAiFeedbackOutput> {
  return provideAiFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiFeedbackPrompt',
  input: {schema: ProvideAiFeedbackInputSchema},
  output: {schema: ProvideAiFeedbackOutputSchema},
  prompt: `You are an AI-powered interview coach providing detailed feedback on an interview answer.

  **Candidate's Context:**
  - **Target Role:** {{jobRole}}
  - **Company:** {{dreamCompany}}
  - **Industry:** {{industry}}

  **Interview Question:**
  "{{question}}"

  **Candidate's Answer:**
  "{{answer}}"

  {{#if bodyLanguageAnalysis}}
  **Body Language Analysis:**
  {{bodyLanguageAnalysis}}
  {{/if}}

  **Your Task:**
  Evaluate the answer based on the following parameters. Provide a score from 0-100 and specific feedback for each of the first four parameters. For the final parameter, provide a summary of recommendations. If body language analysis is provided, incorporate it into your overall assessment and recommendations.

  1.  **Clarity & Conciseness:** Was the answer clear, well-structured, and to the point? Or was it rambling and hard to follow?
  2.  **Content Relevance:** Was the answer relevant to the question asked and tailored to the {{jobRole}} role at {{dreamCompany}}? Did it demonstrate the right skills?
  3.  **STAR Method Usage:** (For behavioral questions) Did the candidate effectively use the STAR method (Situation, Task, Action, Result)? Evaluate the structure. If the question isn't behavioral, state that this isn't applicable.
  4.  **Impact & Results:** Did the candidate effectively quantify their achievements and demonstrate the impact of their actions?
  5.  **Recommendations:** Based on all of the above (including body language if available), provide a summary of the candidate's main strengths and weaknesses, followed by specific, actionable recommendations for improvement.

  Format your entire response as a single JSON object matching the output schema.
  `,
});

const provideAiFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAiFeedbackFlow',
    inputSchema: ProvideAiFeedbackInputSchema,
    outputSchema: ProvideAiFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
