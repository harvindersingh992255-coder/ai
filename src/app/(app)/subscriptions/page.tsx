'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, QrCode, Star } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { useUser } from '@/context/user-context';
import type { Plan } from '@/lib/types';
import { cn } from '@/lib/utils';

const plans: { name: Plan, price: string, priceDescription: string, features: string[], isPopular: boolean, icon: React.ElementType }[] = [
  {
    name: 'Basic',
    price: 'Free',
    priceDescription: 'Get started for free',
    features: [
      '5 interview sessions per month',
      'Standard AI verbal feedback',
      'Access to question bank',
    ],
    isPopular: false,
    icon: () => null,
  },
  {
    name: 'Premium',
    price: '₹149',
    priceDescription: 'per month',
    features: [
      'Unlimited interview sessions',
      'Advanced AI verbal feedback',
      'AI Body Language Analysis',
      'AI Confidence Coach',
    ],
    isPopular: true,
    icon: Star,
  },
  {
    name: 'Super Pack',
    price: '₹299',
    priceDescription: 'per month',
    features: [
      'All Premium features',
      'AI Resume Analyzer',
      'Personalized Resume Builder',
      'Priority support',
    ],
    isPopular: false,
    icon: Crown,
  },
];

export default function SubscriptionsPage() {
  const { plan: currentPlan, setPlan } = useUser();

  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Find the perfect plan</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Unlock your potential and land your dream job with our tailored subscription plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn('flex flex-col', (plan.isPopular || currentPlan === plan.name) && 'border-primary border-2 shadow-lg')}>
            {(plan.isPopular) && (
              <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg -mt-px">
                Most Popular
              </div>
            )}
             {currentPlan === plan.name && (
                <div className="bg-secondary text-secondary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg -mt-px">
                    Current Plan
                </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <plan.icon className={cn('w-6 h-6', plan.name === 'Premium' ? 'text-yellow-400' : 'text-purple-400')} />
                {plan.name}
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.priceDescription}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2">
               <Button 
                className="w-full" 
                variant={(plan.isPopular || currentPlan === plan.name) ? 'default' : 'outline'}
                onClick={() => setPlan(plan.name)}
                disabled={currentPlan === plan.name}
                >
                {currentPlan === plan.name ? 'Current Plan' : plan.price === 'Free' ? 'Downgrade to Basic' : 'Choose Plan'}
              </Button>
              {plan.price !== 'Free' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="secondary">
                      <QrCode className="mr-2" /> Pay with QR
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Scan to Pay for {plan.name} Plan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Use your favorite UPI app to scan the QR code below and complete the payment for {plan.price}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-center p-4">
                      <Image 
                        src="https://placehold.co/200x200.png?text=Scan+to+Pay" 
                        alt={`QR Code for ${plan.name} plan`}
                        width={200}
                        height={200}
                        className="rounded-lg" 
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
