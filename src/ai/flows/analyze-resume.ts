'use server';

/**
 * @fileOverview An AI flow for analyzing a user's resume.
 *
 * - analyzeResume - A function that analyzes resume content.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the user\'s resume.'),
  jobRole: z.string().describe('The target job role the user is applying for.'),
  industry: z.string().describe('The industry of the target job role.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const ResumeAnalysisSectionSchema = z.object({
    score: z.number().min(0).max(100).describe('The score for this section, from 0 to 100.'),
    feedback: z.string().describe('Specific feedback and suggestions for this section.'),
});

const AnalyzeResumeOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('An overall score for the resume, from 0 to 100.'),
  formatAndReadability: ResumeAnalysisSectionSchema.describe('Analysis of the resume\'s visual layout, clarity, and ease of reading.'),
  impactAndQuantification: ResumeAnalysisSectionSchema.describe('Analysis of how well the resume uses quantifiable achievements and demonstrates impact.'),
  keywordOptimization: ResumeAnalysisSectionSchema.describe('Analysis of how well the resume is optimized with relevant keywords for the target job and industry.'),
  summarySection: ResumeAnalysisSectionSchema.describe('Analysis of the professional summary or objective statement.'),
  overallSummary: z.string().describe('A high-level summary of the resume\'s strengths and areas for improvement.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: { schema: AnalyzeResumeInputSchema },
  output: { schema: AnalyzeResumeOutputSchema },
  prompt: `You are an expert career coach and professional resume writer. Analyze the following resume text for a candidate targeting a {{{jobRole}}} position in the {{{industry}}} industry.

Resume Text:
---
{{{resumeText}}}
---

Your Task:
Provide a detailed analysis of the resume. Evaluate it based on the following criteria, providing a score from 0-100 and specific, actionable feedback for each.

1.  **Format & Readability:** Is it clean, professional, and easy to skim? Is there a good balance of whitespace and text?
2.  **Impact & Quantification:** Does the candidate use strong action verbs? Are achievements quantified with numbers, percentages, or other metrics?
3.  **Keyword Optimization:** Does the resume include relevant keywords for the {{{jobRole}}} and {{{industry}}}? Does it seem well-suited for passing through an Applicant Tracking System (ATS)?
4.  **Summary/Objective Section:** Is the summary compelling? Does it effectively pitch the candidate?

Finally, provide an overall score and a summary of the analysis. Format your entire response as a single JSON object.
`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeResumePrompt(input);
    return output!;
  }
);
