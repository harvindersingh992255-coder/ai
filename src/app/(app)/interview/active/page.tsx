'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewState, useInterviewDispatch } from '@/context/interview-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { provideAiFeedback } from '@/ai/flows/provide-ai-feedback';
import { detectBodyLanguage } from '@/ai/flows/detect-body-language';
import { Mic, MicOff, Video, VideoOff, Loader2, StopCircle } from 'lucide-react';

// SpeechRecognition API might be prefixed
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export default function ActiveInterviewPage() {
  const state = useInterviewState();
  const dispatch = useInterviewDispatch();
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        dispatch({ type: 'SET_ERROR', payload: 'Camera and microphone access denied.' });
      }
    }
    setupMedia();

    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecordingAndListening = () => {
    if (mediaStream && SpeechRecognition) {
      setIsRecording(true);
      setIsListening(true);
      setTranscript('');
      recordedChunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(mediaStream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.start();

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event:any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(transcript + finalTranscript + interimTranscript);
      };
      recognitionRef.current.start();
    }
  };

  const stopRecordingAndListening = () => {
    setIsRecording(false);
    setIsListening(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        dispatch({ type: 'SUBMIT_ANSWER', payload: { transcript, videoBlob } });
      };
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  const handleNext = () => {
    stopRecordingAndListening();
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

    const feedbackPromises = state.userAnswers.map(async (answer, index) => {
        const question = state.questions[index];
        const settings = state.settings!;
        
        let bodyLanguage: any = null;
        let bodyLanguageAnalysisText = '';

        if(answer.videoBlob) {
            const reader = new FileReader();
            const dataUriPromise = new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(answer.videoBlob!);
            });
            const videoDataUri = await dataUriPromise;
            try {
              bodyLanguage = await detectBodyLanguage({ videoDataUri });
              bodyLanguageAnalysisText = `Body Language: ${bodyLanguage.bodyLanguageFeedback}. Eye Contact: ${bodyLanguage.eyeContactFeedback}.`;
            } catch (e) {
              console.error("Body language detection failed", e)
            }
        }

        try {
          const aiFeedback = await provideAiFeedback({
            jobRole: settings.jobRole,
            industry: settings.industry,
            question,
            answer: answer.transcript,
            bodyLanguageAnalysis: bodyLanguageAnalysisText
          });
          return { aiFeedback, bodyLanguage };
        } catch(e) {
          console.error("AI feedback failed", e);
          return null;
        }
    });

    const results = await Promise.all(feedbackPromises);
    const aiFeedbacks = results.map(r => r?.aiFeedback ?? null);
    const bodyLanguageFeedbacks = results.map(r => r?.bodyLanguage ?? null);

    dispatch({ type: 'FEEDBACK_GENERATED', payload: { feedback: aiFeedbacks, bodyLanguageFeedback: bodyLanguageFeedbacks } });
    router.push(`/interview/results/${state.sessionId}`);
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

  return (
    <div className="container mx-auto h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Question {state.currentQuestionIndex + 1} of {state.questions.length}</h1>
        <Button variant="destructive" size="sm" onClick={handleEndInterview}>End Interview</Button>
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
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!mediaStream && <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><VideoOff className="w-8 h-8" /></div>}
          </div>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground min-h-[60px]">{isRecording ? transcript || "Listening..." : (state.userAnswers[state.currentQuestionIndex]?.transcript || "Press record to start answering.")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 py-4">
        <Button size="lg" onClick={isRecording ? stopRecordingAndListening : startRecordingAndListening} disabled={!mediaStream}>
          {isRecording ? <><StopCircle className="mr-2" /> Stop</> : <><Mic className="mr-2" /> Record Answer</>}
        </Button>
        <Button size="lg" variant="outline" onClick={handleNext} disabled={isRecording}>
            {state.currentQuestionIndex < state.questions.length - 1 ? 'Next Question' : 'Finish & Get Feedback'}
        </Button>
      </div>
    </div>
  );
}
