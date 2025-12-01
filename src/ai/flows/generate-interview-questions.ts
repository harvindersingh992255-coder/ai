'use server';

/**
 * @fileOverview A flow for generating interview questions based on job role and industry.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobRole: z.string().describe('The job role for which interview questions should be generated.'),
  industry: z.string().describe('The industry related to the job role.'),
  experienceLevel: z.number().describe('The user\'s years of experience.'),
  focusSkills: z.string().optional().describe('Specific skills the user wants to focus on.'),
  numQuestions: z.number().default(5).describe('The number of questions to generate'),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated interview questions.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const generateInterviewQuestionsPrompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert career coach specializing in helping candidates prepare for job interviews. Generate a list of {{{numQuestions}}} interview questions for the role of {{{jobRole}}} in the {{{industry}}} industry.

The candidate has {{{experienceLevel}}} years of experience.
{{#if focusSkills}}
The candidate wants to specifically focus on the following skills: {{{focusSkills}}}.
{{/if}}

Tailor the questions to be appropriate for the candidate's experience level. Focus on behavioral and technical questions that assess the candidate's skills and experience. Ensure the questions are challenging and relevant to the current job market. Return the questions as an array of strings.
`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateInterviewQuestionsPrompt(input);
    return output!;
  }
);
