'use client';

import { useInterviewDispatch } from '@/context/interview-context';
import { useRouter } from 'next/navigation';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import type { InterviewSettings } from '@/lib/types';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const industries = ["Technology", "Finance", "Healthcare", "E-commerce", "Education", "Marketing", "Consulting"];

export default function InterviewSetupPage() {
  const dispatch = useInterviewDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, watch } = useForm<InterviewSettings>({
    defaultValues: {
      dreamCompany: 'Google',
      industry: 'Technology',
      jobRole: 'Software Engineer',
      interviewType: 'general',
      difficulty: 5,
      numQuestions: 5,
      experienceLevel: 2, // This will be updated, but we keep it for the AI flow
      focusSkills: '',
    },
  });

  const difficultyValue = watch('difficulty');
  const numQuestionsValue = watch('numQuestions');

  const onSubmit = async (data: InterviewSettings) => {
    setIsLoading(true);
    // We can map difficulty to experience level for the AI
    const mappedExperience = Math.ceil(data.difficulty / 2);
    const settingsWithExperience = { ...data, experienceLevel: mappedExperience };

    dispatch({ type: 'SET_SETTINGS', payload: settingsWithExperience });
    try {
      const result = await generateInterviewQuestions({
        dreamCompany: settingsWithExperience.dreamCompany,
        industry: settingsWithExperience.industry,
        jobRole: settingsWithExperience.jobRole,
        experienceLevel: settingsWithExperience.experienceLevel,
        focusSkills: settingsWithExperience.focusSkills,
        numQuestions: settingsWithExperience.numQuestions,
      });
      const sessionId = `session_${Date.now()}`;
      // This action now sets the status to 'in_progress'
      dispatch({ type: 'QUESTIONS_GENERATED', payload: { questions: result.questions, sessionId } });
      router.push('/interview/active');
    } catch (error) {
      console.error("Failed to generate questions:", error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate questions.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set Up Your Mock Interview</CardTitle>
          <CardDescription>
            Customize your practice session to match your career goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dreamCompany">Dream Company</Label>
                 <Controller
                  name="dreamCompany"
                  control={control}
                  render={({ field }) => (
                    <Input id="dreamCompany" placeholder="e.g. Google, Netflix" {...field} />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">Target Job Role</Label>
                 <Controller
                  name="jobRole"
                  control={control}
                  render={({ field }) => (
                    <Input id="jobRole" placeholder="e.g. Frontend Developer" {...field} />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
                <Label>Industry</Label>
                 <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label>Interview Type</Label>
                <Controller
                  name="interviewType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interview type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level: {difficultyValue}/10</Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Slider
                      id="difficulty"
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                    />
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numQuestions">Interview Length: {numQuestionsValue} questions</Label>
              <Controller
                name="numQuestions"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Slider
                    id="numQuestions"
                    min={3}
                    max={10}
                    step={1}
                    defaultValue={[value]}
                    onValueChange={(vals) => onChange(vals[0])}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusSkills">Skills to Focus On (Optional)</Label>
              <Controller
                  name="focusSkills"
                  control={control}
                  render={({ field }) => (
                    <Textarea id="focusSkills" placeholder="e.g. System Design, Leadership, React, Go-to-market strategy..." {...field} />
                  )}
                />
              <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
            </div>


            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                'Start Interview'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
