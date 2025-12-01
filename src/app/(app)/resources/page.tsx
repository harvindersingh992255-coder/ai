import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book />
            Tips & Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Explore articles, video tutorials, and best practices to sharpen your interview skills. Coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
