import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export default function QuestionsPage() {
  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database />
            Question Bank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here you will be able to search, filter, and practice individual questions. This feature is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
