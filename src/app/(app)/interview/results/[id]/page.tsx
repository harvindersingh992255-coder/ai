'use client';
import { useInterviewState, useInterviewDispatch } from '@/context/interview-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Home, MessageSquareQuote, RefreshCw, Star, Target, Zap } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const FeedbackCard = ({ title, score, feedback, icon: Icon }: { title: string; score: number; feedback: string; icon: React.ElementType }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon className="w-4 h-4 text-primary"/> {title}</span>
          <Badge variant={score > 80 ? "default" : score > 60 ? "secondary" : "destructive"} className="bg-opacity-20 text-foreground">{score}/100</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent><p className="text-sm text-muted-foreground">{feedback}</p></CardContent>
    </Card>
);


export default function ResultsPage() {
  const state = useInterviewState();
  const dispatch = useInterviewDispatch();
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    if (state.status !== 'complete' || params.id !== state.sessionId) {
      router.push('/dashboard');
    }
  }, [state.status, params.id, state.sessionId, router]);


  const overallScore = useMemo(() => {
    const validScores = state.feedback.filter(f => f?.overallScore).map(f => f!.overallScore);
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
          <CardDescription>Here&apos;s a detailed breakdown of your performance for the <strong>{state.settings?.jobRole}</strong> role at <strong>{state.settings?.dreamCompany}</strong>.</CardDescription>
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

      <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
        {state.questions.map((question, index) => {
          const feedback = state.feedback[index];
          const userAnswer = state.userAnswers[index];

          return (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4 items-center">
                  <span className="text-left font-semibold flex-1 truncate pr-4">Question {index + 1}: {question}</span>
                  <span className={`font-bold text-sm ${ (feedback?.overallScore ?? 0) >= 80 ? 'text-accent' : (feedback?.overallScore ?? 0) >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                    Score: {feedback?.overallScore ?? 'N/A'}%
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6">
                <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Your Answer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground italic">"{userAnswer?.transcript || 'No answer recorded.'}"</p>
                    </CardContent>
                </Card>

                {feedback ? (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FeedbackCard title="Clarity & Conciseness" score={feedback.clarityAndConciseness.score} feedback={feedback.clarityAndConciseness.feedback} icon={Zap} />
                            <FeedbackCard title="Content Relevance" score={feedback.contentRelevance.score} feedback={feedback.contentRelevance.feedback} icon={Target} />
                            <FeedbackCard title="STAR Method Usage" score={feedback.starMethodUsage.score} feedback={feedback.starMethodUsage.feedback} icon={Star} />
                            <FeedbackCard title="Impact & Results" score={feedback.impactAndResults.score} feedback={feedback.impactAndResults.feedback} icon={CheckCircle2} />
                        </div>
                        <Separator />
                         <Card className="bg-transparent border-0 shadow-none">
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="text-base flex items-center gap-2"><MessageSquareQuote className="text-primary"/> Overall Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0"><p className="text-sm text-muted-foreground">{feedback.recommendations}</p></CardContent>
                        </Card>
                    </div>
                ) : <p className="text-muted-foreground text-center py-4">AI feedback could not be generated for this question.</p>}
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
