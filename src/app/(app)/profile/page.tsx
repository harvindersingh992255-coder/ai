import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage your profile, career goals, and notification preferences here. This feature is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
