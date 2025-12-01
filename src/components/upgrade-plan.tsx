'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

interface UpgradePlanProps {
  featureName: string;
  requiredPlan?: 'Premium' | 'Super Pack';
}

export function UpgradePlan({ featureName, requiredPlan = 'Premium' }: UpgradePlanProps) {
  return (
    <div className="container mx-auto flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
             <Crown className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="mt-4">Upgrade to Access {featureName}</CardTitle>
          <CardDescription>
            The <strong>{featureName}</strong> is a premium feature. Please upgrade to the <strong>{requiredPlan}</strong> plan to unlock this and many other powerful tools to help you land your dream job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/subscriptions" passHref>
            <Button size="lg">Upgrade Your Plan</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
