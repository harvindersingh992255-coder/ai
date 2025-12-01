'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type ProfileSetupForm = Omit<User, 'avatarUrl' | 'plan'>;

const degrees = ["High School", "Bachelor's", "Master's", "PhD", "Other"];

export default function ProfileSetupPage() {
  const { setUser } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<ProfileSetupForm>({
    defaultValues: {
      name: '',
      degree: "Bachelor's",
      fieldOfStudy: '',
      yearsOfExperience: 2,
      keySkills: '',
    },
  });

  const yearsOfExperience = watch('yearsOfExperience');

  const onSubmit = (data: ProfileSetupForm) => {
    setIsLoading(true);
    setUser(prev => ({
        ...prev,
        ...data
    }));
    // Simulate a network request
    setTimeout(() => {
        router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us tailor your interview experience by telling us a bit about your background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Full name is required' }}
                render={({ field }) => <Input id="name" placeholder="e.g. Jane Doe" {...field} />}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Highest Degree</Label>
                <Controller
                  name="degree"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {degrees.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Controller
                  name="fieldOfStudy"
                  control={control}
                  render={({ field }) => <Input id="fieldOfStudy" placeholder="e.g. Computer Science" {...field} />}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Professional Experience: {yearsOfExperience} years</Label>
              <Controller
                name="yearsOfExperience"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Slider
                    id="yearsOfExperience"
                    min={0}
                    max={20}
                    step={1}
                    defaultValue={[value ?? 0]}
                    onValueChange={(vals) => onChange(vals[0])}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keySkills">Key Skills</Label>
              <Controller
                name="keySkills"
                control={control}
                render={({ field }) => (
                  <Textarea id="keySkills" placeholder="e.g. React, Node.js, System Design, Product Management..." {...field} />
                )}
              />
              <p className="text-xs text-muted-foreground">Separate skills with commas. This will help us tailor questions.</p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save and Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
