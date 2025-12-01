import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function ResumeBuilderPage() {
  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList />
            Personalized Resume Builder
          </CardTitle>
          <CardDescription>
            Create a professional, polished resume from scratch with AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">This feature is currently under development.</p>
            <p className="text-muted-foreground mt-2">The Resume Builder is coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
