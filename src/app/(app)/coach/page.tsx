'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { UpgradePlan } from '@/components/upgrade-plan';

const affirmations = [
  "You are capable of amazing things.",
  "Your skills and experience are valuable.",
  "You are prepared to ace this interview.",
  "Believe in yourself and your abilities.",
  "Every interview is a learning opportunity.",
  "You've got this!",
  "Confidence is your greatest asset.",
  "Stay positive and focus on your strengths."
];

export default function CoachPage() {
  const { plan } = useUser();
  const [affirmation, setAffirmation] = useState('Click the button to get a confidence boost!');

  const getNewAffirmation = () => {
    const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(newAffirmation);
  };

  if (plan === 'Basic') {
    return <UpgradePlan featureName="AI Confidence Coach" />;
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-full">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl">AI Confidence Coach</CardTitle>
          </div>
          <CardDescription>Your personal cheerleader to help you shine in your next interview.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 border-2 border-dashed border-primary/50 rounded-lg p-8 min-h-[150px] flex items-center justify-center">
            <p className="text-xl font-medium text-primary-foreground">{affirmation}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={getNewAffirmation} className="w-full" size="lg">
            <Zap className="mr-2" />
            Boost My Confidence
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
