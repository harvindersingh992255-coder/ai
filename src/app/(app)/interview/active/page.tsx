'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewState, useInterviewDispatch } from '@/context/interview-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { provideAiFeedback } from '@/ai/flows/provide-ai-feedback';
import { Mic, MicOff, Loader2, StopCircle, AudioLines } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// SpeechRecognition API might be prefixed
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export default function ActiveInterviewPage() {
  const state = useInterviewState();
  const dispatch = useInterviewDispatch();
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState(false);

  const recognitionRef = useRef<any>(null); // SpeechRecognition instance

  useEffect(() => {
    if (state.status !== 'in_progress') {
       // Allow access from results page for retake
      if (state.status === 'complete' && state.sessionId) {
        dispatch({ type: 'START_INTERVIEW' });
      } else {
        router.push('/interview/setup');
      }
    }
  }, [state.status, router, dispatch, state.sessionId]);

  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);
        setHasMicPermission(true);
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setHasMicPermission(false);
        dispatch({ type: 'SET_ERROR', payload: 'Microphone access denied.' });
      }
    }
    setupMedia();

    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
      recognitionRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecordingAndListening = () => {
    if (mediaStream && SpeechRecognition) {
      setIsRecording(true);
      setTranscript('');

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      let finalTranscript = '';
      recognitionRef.current.onresult = (event:any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript + interimTranscript);
      };
      recognitionRef.current.onend = () => {
        // Only submit if we were actually recording
        if (isRecording) {
            setIsRecording(false);
            dispatch({ type: 'SUBMIT_ANSWER', payload: { transcript: finalTranscript, videoBlob: null } });
        }
      };
      recognitionRef.current.start();
    }
  };

  const stopRecordingAndListening = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    setIsRecording(false);
  };
  
  const handleNext = () => {
    if (isRecording) {
        stopRecordingAndListening();
    }
    
    if (state.currentQuestionIndex < state.questions.length - 1) {
        dispatch({ type: 'NEXT_QUESTION' });
        setTranscript('');
    } else {
        handleEndInterview();
    }
  };

  const handleEndInterview = async () => {
    if(isRecording) {
      stopRecordingAndListening();
    }
    dispatch({ type: 'START_FEEDBACK_GENERATION' });

    // Use a timeout to ensure final answer is processed by reducer
    setTimeout(async () => {
        const feedbackPromises = state.userAnswers.map(async (answer, index) => {
            if (!answer || !answer.transcript) return null;
            const question = state.questions[index];
            const settings = state.settings!;
            
            try {
              const aiFeedback = await provideAiFeedback({
                dreamCompany: settings.dreamCompany,
                industry: settings.industry,
                jobRole: settings.jobRole,
                question,
                answer: answer.transcript,
              });
              return { aiFeedback, bodyLanguage: null }; // No body language feedback
            } catch(e) {
              console.error("AI feedback failed", e);
              return null;
            }
        });

        const results = await Promise.all(feedbackPromises);
        const aiFeedbacks = results.map(r => r?.aiFeedback ?? null);
        
        dispatch({ type: 'FEEDBACK_GENERATED', payload: { feedback: aiFeedbacks, bodyLanguageFeedback: [] } });
        router.push(`/interview/results/${state.sessionId}`);
    }, 500); // Give it a moment to update state
};

  if (state.status === 'generating_feedback') {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Analyzing your performance...</h2>
            <p className="text-muted-foreground">Our AI is preparing your detailed feedback. This might take a moment.</p>
        </div>
    );
  }

  if (state.status !== 'in_progress' || state.questions.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }
  
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const lastAnswer = state.userAnswers[state.currentQuestionIndex]?.transcript;

  return (
    <div className="container mx-auto h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Question {state.currentQuestionIndex + 1} of {state.questions.length}</h1>
        <Button variant="destructive" size="sm" onClick={handleEndInterview} disabled={isRecording}>End Interview</Button>
      </div>
      <Progress value={((state.currentQuestionIndex + 1) / state.questions.length) * 100} />

      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 text-lg font-medium flex items-center justify-center text-center">
            <p>{currentQuestion}</p>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          {!hasMicPermission && (
            <Alert variant="destructive">
              <MicOff className="h-4 w-4" />
              <AlertTitle>Microphone Access Required</AlertTitle>
              <AlertDescription>
                Please enable microphone permissions in your browser settings to record your answers.
              </AlertDescription>
            </Alert>
          )}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Answer
                {isRecording && <AudioLines className="w-5 h-5 text-primary animate-pulse" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground min-h-[120px]">
                {isRecording 
                    ? transcript || "Listening..." 
                    : lastAnswer || "Press record to start answering."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 py-4">
        <Button size="lg" onClick={isRecording ? stopRecordingAndListening : startRecordingAndListening} disabled={!hasMicPermission}>
          {isRecording ? <><StopCircle className="mr-2" /> Stop</> : <><Mic className="mr-2" /> Record Answer</>}
        </Button>
        <Button size="lg" variant="outline" onClick={handleNext} disabled={isRecording}>
            {state.currentQuestionIndex < state.questions.length - 1 ? 'Next Question' : 'Finish & Get Feedback'}
        </Button>
      </div>
    </div>
  );
}
