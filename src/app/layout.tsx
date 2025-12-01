
import { InterviewProvider } from '@/context/interview-context';

export default function RootLayout({ children }) {
  return (
    <InterviewProvider>
      {children}
    </InterviewProvider>
  );
}
