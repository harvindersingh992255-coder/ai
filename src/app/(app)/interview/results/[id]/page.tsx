'use client';
import { useInterviewState, useInterviewDispatch } from '@/context/interview-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, MessageSquareQuote, Eye, PersonStanding, RefreshCw, Home } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';
import Link from 'next/link';

export default function ResultsPage() {
  const state = useInterviewState();
  const dispatch = useInterviewDispatch();
  const router = useRouter();
  const params = useParams();
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  
  useEffect(() => {
    if (state.status !== 'complete' || params.id !== state.sessionId) {
      router.push('/dashboard');
    }
  }, [state.status, params.id, state.sessionId, router]);

  useEffect(() => {
    const urls = state.userAnswers.map(answer => 
      answer.videoBlob ? URL.createObjectURL(answer.videoBlob) : ''
    );
    setVideoUrls(urls);
    
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [state.userAnswers]);

  const overallScore = useMemo(() => {
    const validScores = state.feedback.filter(f => f?.score).map(f => f!.score);
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  }, [state.feedback]);

  const handleRetake = () => {
    dispatch({ type: 'START_INTERVIEW' });
    router.push('/interview/active');
  }

  if (state.status !== 'complete') {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Interview Report</CardTitle>
          <CardDescription>Here&apos;s a detailed breakdown of your performance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <CircularProgress value={overallScore} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Overall Score: {overallScore}%</h3>
            <p className="text-muted-foreground mt-2">
              Excellent work! This score reflects a strong performance across all questions. You demonstrated good communication skills and relevant knowledge. See below for a detailed analysis.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-2xl font-bold">Question by Question Analysis</h2>

      <Accordion type="single" collapsible className="w-full">
        {state.questions.map((question, index) => {
          const feedback = state.feedback[index];
          const bodyLanguage = state.bodyLanguageFeedback[index];
          const videoUrl = videoUrls[index];

          return (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4">
                  <span className="text-left font-semibold">Question {index + 1}</span>
                  <span className={`font-bold ${ (feedback?.score ?? 0) >= 80 ? 'text-accent' : (feedback?.score ?? 0) >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                    Score: {feedback?.score ?? 'N/A'}%
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6">
                <p className="font-semibold text-primary/80">{question}</p>
                {videoUrl && (
                  <video src={videoUrl} controls className="w-full rounded-md border" />
                )}
                <div className="grid md:grid-cols-2 gap-4">
                    {feedback ? (
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="text-accent"/> Strengths</CardTitle>
                                </CardHeader>
                                <CardContent><p className="text-sm">{feedback.strengths}</p></CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><XCircle className="text-destructive"/> Areas for Improvement</CardTitle>
                                </CardHeader>
                                <CardContent><p className="text-sm">{feedback.weaknesses}</p></CardContent>
                            </Card>
                             <Card className="md:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><MessageSquareQuote className="text-primary"/> Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent><p className="text-sm">{feedback.recommendations}</p></CardContent>
                            </Card>
                        </>
                    ) : <p className="text-muted-foreground md:col-span-2">AI feedback could not be generated for this question.</p>}

                    {bodyLanguage && (
                         <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><PersonStanding className="text-blue-500"/> Body Language</CardTitle>
                                </CardHeader>
                                <CardContent><p className="text-sm">{bodyLanguage.bodyLanguageFeedback}</p></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><Eye className="text-purple-500"/> Eye Contact</CardTitle>
                                </CardHeader>
                                <CardContent><p className="text-sm">{bodyLanguage.eyeContactFeedback}</p></CardContent>
                            </Card>
                        </>
                    )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button onClick={handleRetake} size="lg"><RefreshCw className="mr-2 h-4 w-4"/> Retake This Interview</Button>
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="lg"><Home className="mr-2 h-4 w-4"/> Back to Dashboard</Button>
          </Link>
      </div>
    </div>
  );
}
