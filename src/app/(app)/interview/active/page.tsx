'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewState, useInterviewDispatch } from '@/context/interview-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { provideAiFeedback } from '@/ai/flows/provide-ai-feedback';
import { analyzeBodyLanguage } from '@/ai/flows/analyze-body-language';
import { Mic, MicOff, Loader2, StopCircle, AudioLines, Video, VideoOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { blobToDataURI } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


// SpeechRecognition API might be prefixed
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export default function ActiveInterviewPage() {
  const state = useInterviewState();
  const dispatch = useInterviewDispatch();
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const recognitionRef = useRef<any>(null); // SpeechRecognition instance
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoChunksRef = useRef<Blob[]>([]);

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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMediaStream(stream);
        setHasMicPermission(true);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        if (err instanceof Error && err.name.includes('NotAllowed')) {
            dispatch({ type: 'SET_ERROR', payload: 'Microphone and camera access denied.' });
            setHasMicPermission(false);
            setHasCameraPermission(false);
        }
      }
    }
    setupMedia();

    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      mediaRecorderRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const startRecordingAndListening = () => {
    if (mediaStream && SpeechRecognition) {
      setIsRecording(true);
      setTranscript('');
      videoChunksRef.current = [];

      // Start video recording
      mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.start();
      
      // Start speech recognition
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
        // Only submit if we were actually recording and this wasn't an accidental stop
        if (isRecording) {
            setIsRecording(false);
            const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
            // Prioritize written answer if available
            const answerToSubmit = writtenAnswer.trim() || finalTranscript;
            dispatch({ type: 'SUBMIT_ANSWER', payload: { transcript: answerToSubmit, videoBlob: videoBlob } });
        }
      };
      recognitionRef.current.start();
    }
  };

  const stopRecordingAndListening = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };
  
  const handleNext = () => {
    if (isRecording) {
        stopRecordingAndListening();
    } else {
        // If not recording, but there is a written answer, submit it.
        if (writtenAnswer.trim()) {
            const videoBlob = videoChunksRef.current.length > 0 ? new Blob(videoChunksRef.current, { type: 'video/webm' }) : null;
            dispatch({ type: 'SUBMIT_ANSWER', payload: { transcript: writtenAnswer, videoBlob } });
        }
    }
    
    if (state.currentQuestionIndex < state.questions.length - 1) {
        dispatch({ type: 'NEXT_QUESTION' });
        setTranscript('');
        setWrittenAnswer('');
    } else {
        handleEndInterview();
    }
  };

  const handleEndInterview = async () => {
    if(isRecording) {
      stopRecordingAndListening();
    } else {
      if (writtenAnswer.trim() && !state.userAnswers[state.currentQuestionIndex]) {
        const videoBlob = videoChunksRef.current.length > 0 ? new Blob(videoChunksRef.current, { type: 'video/webm' }) : null;
        dispatch({ type: 'SUBMIT_ANSWER', payload: { transcript: writtenAnswer, videoBlob } });
      }
    }
    dispatch({ type: 'START_FEEDBACK_GENERATION' });

    // Use a timeout to ensure final answer is processed by reducer
    setTimeout(async () => {
        const feedbackPromises = state.userAnswers.map(async (answer, index) => {
            if (!answer || (!answer.transcript && !answer.videoBlob)) return null;

            const question = state.questions[index];
            const settings = state.settings!;
            let bodyLanguageAnalysisResult = null;
            let verbalFeedback = null;
            
            try {
              if (answer.videoBlob) {
                const videoDataUri = await blobToDataURI(answer.videoBlob);
                bodyLanguageAnalysisResult = await analyzeBodyLanguage({ videoDataUri, question });
              }

              const bodyLanguageSummary = bodyLanguageAnalysisResult?.overallAnalysis;
              
              if (answer.transcript) {
                verbalFeedback = await provideAiFeedback({
                  dreamCompany: settings.dreamCompany,
                  industry: settings.industry,
                  jobRole: settings.jobRole,
                  question,
                  answer: answer.transcript,
                  bodyLanguageAnalysis: bodyLanguageSummary,
                });
              }

              return { aiFeedback: verbalFeedback, bodyLanguage: bodyLanguageAnalysisResult };
            } catch(e) {
              console.error("AI feedback failed for question", index, e);
              return { aiFeedback: verbalFeedback, bodyLanguage: bodyLanguageAnalysisResult }; // Return partial results
            }
        });

        const results = await Promise.all(feedbackPromises);
        const aiFeedbacks = results.map(r => r?.aiFeedback ?? null);
        const bodyLanguageFeedbacks = results.map(r => r?.bodyLanguage ?? null);
        
        dispatch({ type: 'FEEDBACK_GENERATED', payload: { feedback: aiFeedbacks, bodyLanguageFeedback: bodyLanguageFeedbacks } });
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
          {(!hasMicPermission || !hasCameraPermission) && (
            <Alert variant="destructive">
              { !hasCameraPermission ? <VideoOff className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <AlertTitle>Permissions Required</AlertTitle>
              <AlertDescription>
                Please enable microphone and camera permissions in your browser settings to record your answers.
              </AlertDescription>
            </Alert>
          )}
          <Card className="flex-1 flex flex-col">
             <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Video
                  {isRecording && <div className="flex items-center gap-2 text-destructive"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span></span> REC</div>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center bg-secondary/20 rounded-md">
                 <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
              </CardContent>
          </Card>
        </div>
      </div>
      <Card className="mt-4">
        <Tabs defaultValue="record" className="w-full">
          <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Answer</CardTitle>
                <TabsList>
                  <TabsTrigger value="record">Record</TabsTrigger>
                  <TabsTrigger value="write">Write</TabsTrigger>
                </TabsList>
              </div>
          </CardHeader>
          <TabsContent value="record">
            <CardContent>
               <div className="flex items-center gap-4">
                 <Button size="lg" onClick={isRecording ? stopRecordingAndListening : startRecordingAndListening} disabled={!hasMicPermission || !hasCameraPermission}>
                    {isRecording ? <><StopCircle className="mr-2" /> Stop</> : <><Mic className="mr-2" /> Record Answer</>}
                  </Button>
                  <div className="text-sm text-muted-foreground min-h-[40px] flex-1 flex items-center">
                    {isRecording && <AudioLines className="w-5 h-5 text-primary animate-pulse mr-2" />}
                    <span>
                      {isRecording 
                          ? transcript || "Listening..." 
                          : lastAnswer || "Press record to start answering."}
                    </span>
                  </div>
               </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="write">
              <CardContent>
                <Textarea 
                  placeholder="Type your answer here..."
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
      <div className="flex justify-center items-center gap-4 py-4">
        <Button size="lg" variant="outline" onClick={handleNext} disabled={isRecording}>
            {state.currentQuestionIndex < state.questions.length - 1 ? 'Next Question' : 'Finish & Get Feedback'}
        </Button>
      </div>
    </div>
  );
}
