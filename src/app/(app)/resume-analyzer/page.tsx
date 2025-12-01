'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UpgradePlan } from '@/components/upgrade-plan';
import { useUser } from '@/context/user-context';
import { FileSearch } from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const { plan } = useUser();

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
            Upload or paste your resume to get instant feedback on how to improve it for your target job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">This feature is currently under development.</p>
            <p className="text-muted-foreground mt-2">Check back soon to use the AI Resume Analyzer!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
