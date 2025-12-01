'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User />
              {user.name}'s Profile
            </CardTitle>
            <CardDescription>
              View and manage your professional background.
            </CardDescription>
          </div>
          <Link href="/profile/setup" passHref>
             <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p>{user.name || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Highest Degree</p>
                <p>{user.degree || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Field of Study</p>
                <p>{user.fieldOfStudy || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Years of Experience</p>
                <p>{user.yearsOfExperience ?? 'Not set'} years</p>
              </div>
          </div>
           <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Key Skills</p>
              <p className="whitespace-pre-wrap">{user.keySkills || 'Not set'}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
