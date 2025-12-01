import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History />
            Interview History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>A list of all your past interview sessions will appear here. This feature is currently in development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
