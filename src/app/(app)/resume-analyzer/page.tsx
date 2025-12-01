
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UpgradePlan } from '@/components/upgrade-plan';
import { useUser } from '@/context/user-context';
import { FileSearch, Loader2, Wand2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { analyzeResume, type AnalyzeResumeOutput, type AnalyzeResumeInput } from '@/ai/flows/analyze-resume';
import { Separator } from '@/components/ui/separator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const FeedbackSection = ({ title, score, feedback }: { title: string; score: number; feedback: string; }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold">{title}</h4>
      <Badge variant={score > 80 ? 'default' : score > 60 ? 'secondary' : 'destructive'} className="bg-opacity-20 text-foreground">{score}/100</Badge>
    </div>
    <p className="text-sm text-muted-foreground">{feedback}</p>
  </div>
);


export default function ResumeAnalyzerPage() {
  const { plan } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const { register, handleSubmit, setValue } = useForm<AnalyzeResumeInput>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setValue('resumeText', text);
          toast({
            title: 'File loaded',
            description: `${file.name} has been loaded into the text area.`,
          });
        };
        reader.readAsText(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload a .txt file.',
        });
      }
    }
  };


  const onSubmit = async (data: AnalyzeResumeInput) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeResume(data);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Failed to analyze resume:", error);
       toast({
          variant: 'destructive',
          title: "Analysis Failed",
          description: "There was an error analyzing your resume. Please try again."
      });
    }
    setIsLoading(false);
  };

  if (plan !== 'Super Pack') {
    return <UpgradePlan featureName="AI Resume Analyzer" requiredPlan="Super Pack" />;
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch />
            AI Resume Analyzer
          </CardTitle>
          <CardDescription>
            Paste your resume, or upload a .txt file, and provide a target job to get instant AI-powered feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobRole">Target Job Role</Label>
                <Input id="jobRole" placeholder="e.g. Senior Product Manager" {...register('jobRole', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. SaaS, Fintech" {...register('industry', { required: true })} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resume-upload" className="flex items-center justify-between">
                <span>Paste Your Resume</span>
                <Button asChild variant="outline" size="sm">
                  <label>
                    <Upload className="mr-2"/>
                    Upload .txt file
                    <input type="file" id="resume-upload" className="sr-only" accept=".txt" onChange={handleFileChange} />
                  </label>
                </Button>
              </Label>
              <Textarea
                id="resumeText"
                placeholder="Paste the full text content of your resume here, or use the upload button."
                className="min-h-[250px]"
                {...register('resumeText', { required: true })}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Wand2 className="mr-2" /> Analyze My Resume</>
              )}
            </Button>
          </form>

          {analysisResult && (
            <div className="mt-8 space-y-6">
              <Separator />
              <div className="text-center">
                <h3 className="text-2xl font-bold tracking-tight">Your Analysis is Ready!</h3>
                <p className="text-muted-foreground">Here's how your resume scores for the target role.</p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <CircularProgress value={analysisResult.overallScore} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Overall Summary</h3>
                  <p className="text-muted-foreground mt-2">
                    {analysisResult.overallSummary}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FeedbackSection title="Format & Readability" {...analysisResult.formatAndReadability} />
                         <Separator />
                        <FeedbackSection title="Summary Section" {...analysisResult.summarySection} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Content & Keywords</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FeedbackSection title="Impact & Quantification" {...analysisResult.impactAndQuantification} />
                        <Separator />
                        <FeedbackSection title="Keyword Optimization" {...analysisResult.keywordOptimization} />
                    </CardContent>
                </Card>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
