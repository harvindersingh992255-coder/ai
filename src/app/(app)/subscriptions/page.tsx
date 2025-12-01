import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Star } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    priceDescription: 'Get started for free',
    features: [
      '5 interview sessions per month',
      'Standard AI feedback',
      'Access to question bank',
    ],
    isPopular: false,
  },
  {
    name: 'Premium',
    price: '₹149',
    priceDescription: 'per month',
    features: [
      'Unlimited interview sessions',
      'Advanced AI feedback',
      'AI Confidence Coach',
      'Priority support',
    ],
    isPopular: true,
  },
  {
    name: 'Super Pack',
    price: '₹299',
    priceDescription: 'per month',
    features: [
      'All Premium features',
      'AI Resume Analyzer',
      'Personalized CV builder',
      'In-depth career path guidance',
    ],
    isPopular: false,
  },
];

export default function SubscriptionsPage() {
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
          <Card key={plan.name} className={`flex flex-col ${plan.isPopular ? 'border-primary border-2 shadow-lg' : ''}`}>
            {plan.isPopular && (
              <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg -mt-px">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.name === 'Premium' && <Star className="text-yellow-400" />}
                {plan.name === 'Super Pack' && <Crown className="text-purple-400" />}
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
            <CardFooter>
              <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                {plan.price === 'Free' ? 'Start for Free' : 'Choose Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
