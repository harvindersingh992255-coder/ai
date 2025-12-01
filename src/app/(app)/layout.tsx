import { AppLayout } from '@/components/app-layout';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { InterviewProvider } from '@/context/interview-context';

export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InterviewProvider>
      <AppLayout>
        {children}
        <FirebaseErrorListener />
      </AppLayout>
    </InterviewProvider>
  );
}
