'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/provide-ai-feedback.ts';
import '@/ai/flows/analyze-body-language.ts';
