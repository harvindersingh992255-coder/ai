import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

export default function ProgressPage() {
  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will show your performance timeline, score trends, and goal progress. Check back later!</p>
        </CardContent>
      </Card>
    </div>
  );
}
