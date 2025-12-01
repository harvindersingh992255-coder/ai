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
  question: z.string().describe('The interview question asked.'),
  answer: z.string().describe('The user\'s answer to the interview question.'),
  bodyLanguageAnalysis: z.string().optional().describe('The analysis of the candidate\'s body language during the answer.'),
});
export type ProvideAiFeedbackInput = z.infer<typeof ProvideAiFeedbackInputSchema>;

const ProvideAiFeedbackOutputSchema = z.object({
  score: z.number().describe('An overall score for the answer, out of 100.'),
  strengths: z.string().describe('A summary of the strengths demonstrated in the answer.'),
  weaknesses: z.string().describe('A summary of the weaknesses in the answer.'),
  recommendations: z.string().describe('Specific recommendations for improving the answer.'),
});
export type ProvideAiFeedbackOutput = z.infer<typeof ProvideAiFeedbackOutputSchema>;

export async function provideAiFeedback(input: ProvideAiFeedbackInput): Promise<ProvideAiFeedbackOutput> {
  return provideAiFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiFeedbackPrompt',
  input: {schema: ProvideAiFeedbackInputSchema},
  output: {schema: ProvideAiFeedbackOutputSchema},
  prompt: `You are an AI-powered interview coach providing feedback on interview answers.

  Evaluate the candidate's answer to the following question for a role at {{dreamCompany}} in the {{industry}} industry:

  Question: {{question}}
  Answer: {{answer}}

  {% if bodyLanguageAnalysis %}
  Here is an analysis of their body language:
  {{bodyLanguageAnalysis}}
  {% endif %}

  Provide feedback according to the following guidelines:

  1.  Assign an overall score out of 100, considering the relevance, clarity, and completeness of the answer.
  2.  Identify the strengths demonstrated in the answer.
  3.  Point out the weaknesses in the answer.
  4.  Provide specific and actionable recommendations for improvement.

  Format your response as a JSON object conforming to the following schema:
  ${JSON.stringify(ProvideAiFeedbackOutputSchema.describe(''))}
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
