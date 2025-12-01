
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Copy, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { UpgradePlan } from '@/components/upgrade-plan';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  buildResumeSuggestions,
  type BuildResumeSuggestionsInput,
  type BuildResumeSuggestionsOutput
} from '@/ai/flows/build-resume-suggestions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function ResumeBuilderPage() {
    const { plan } = useUser();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { register, handleSubmit } = useForm<BuildResumeSuggestionsInput>();

    const onSubmit = async (data: BuildResumeSuggestionsInput) => {
        setIsLoading(true);
        setSuggestions([]);
        try {
            const result = await buildResumeSuggestions({ ...data, numSuggestions: 5 });
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error("Failed to generate suggestions:", error);
            toast({
                variant: 'destructive',
                title: "Something went wrong",
                description: "Failed to generate suggestions. Please try again."
            })
        }
        setIsLoading(false);
    }
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
        });
    }

    if (plan !== 'Super Pack') {
        return <UpgradePlan featureName="Personalized Resume Builder" requiredPlan="Super Pack" />;
    }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList />
            AI Resume Bullet Point Generator
          </CardTitle>
          <CardDescription>
            Turn your job responsibilities into powerful, impact-driven resume bullet points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="jobRole">Job Title</Label>
                <Input id="jobRole" placeholder="e.g. Software Engineer" {...register('jobRole', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input id="company" placeholder="e.g. Acme Inc." {...register('company')} />
              </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="responsibilities">Describe Your Responsibilities</Label>
                <Textarea
                    id="responsibilities"
                    placeholder="Briefly describe what you did in this role. For example: 'Was responsible for the main company website and fixed bugs.'"
                    className="min-h-[150px]"
                    {...register('responsibilities', { required: true })}
                />
             </div>
             <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                    <><Wand2 className="mr-2" /> Generate Suggestions</>
                )}
            </Button>
          </form>

          {suggestions.length > 0 && (
            <div className="mt-8">
              <Separator />
              <h3 className="text-xl font-bold tracking-tight my-6 flex items-center gap-2">
                <Sparkles className="text-primary" />
                Generated Bullet Points
              </h3>
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                    <Card key={index} className="bg-muted/30">
                        <CardContent className="p-4 flex items-start justify-between gap-4">
                            <p className="text-sm flex-1">{suggestion}</p>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(suggestion)}>
                                <Copy className="h-4 w-4"/>
                                <span className="sr-only">Copy</span>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
