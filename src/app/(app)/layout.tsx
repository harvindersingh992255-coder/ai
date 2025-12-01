import { AppLayout } from '@/components/app-layout';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { InterviewProvider } from '@/context/interview-context';
import { UserProvider } from '@/context/user-context';

export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <InterviewProvider>
        <AppLayout>
          {children}
          <FirebaseErrorListener />
        </AppLayout>
      </InterviewProvider>
    </UserProvider>
  );
}
