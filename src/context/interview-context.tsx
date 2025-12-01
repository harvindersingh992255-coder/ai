'use client';

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { InterviewSettings, InterviewQuestion, AIFeedback, BodyLanguageFeedback } from '@/lib/types';

type InterviewState = {
  status: 'idle' | 'configuring' | 'generating_questions' | 'in_progress' | 'generating_feedback' | 'complete';
  settings: InterviewSettings | null;
  questions: string[];
  currentQuestionIndex: number;
  userAnswers: { transcript: string; videoBlob: Blob | null }[];
  feedback: (AIFeedback | null)[];
  bodyLanguageFeedback: (BodyLanguageFeedback | null)[];
  error: string | null;
  sessionId: string | null;
};

const initialState: InterviewState = {
  status: 'idle',
  settings: null,
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  feedback: [],
  bodyLanguageFeedback: [],
  error: null,
  sessionId: null,
};

type Action =
  | { type: 'START_SETUP' }
  | { type: 'SET_SETTINGS'; payload: InterviewSettings }
  | { type: 'QUESTIONS_GENERATED'; payload: { questions: string[], sessionId: string } }
  | { type: 'START_INTERVIEW' }
  | { type: 'SUBMIT_ANSWER'; payload: { transcript: string; videoBlob: Blob | null } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'START_FEEDBACK_GENERATION' }
  | { type: 'FEEDBACK_GENERATED'; payload: { feedback: (AIFeedback | null)[]; bodyLanguageFeedback: (BodyLanguageFeedback | null)[] } }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; payload: string };

function interviewReducer(state: InterviewState, action: Action): InterviewState {
  switch (action.type) {
    case 'START_SETUP':
      return { ...initialState, status: 'configuring' };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload, status: 'generating_questions' };
    case 'QUESTIONS_GENERATED':
      // This action now also transitions to the correct status for starting.
      return { ...state, questions: action.payload.questions, sessionId: action.payload.sessionId, status: 'in_progress' };
    case 'START_INTERVIEW':
        // This is now mainly for retakes, ensuring the state is clean.
        return { ...state, status: 'in_progress', currentQuestionIndex: 0, userAnswers: [], feedback: [], bodyLanguageFeedback: [] };
    case 'SUBMIT_ANSWER':
      const newUserAnswers = [...state.userAnswers];
      newUserAnswers[state.currentQuestionIndex] = action.payload;
      return { ...state, userAnswers: newUserAnswers };
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return state; // Or handle end of interview
    case 'START_FEEDBACK_GENERATION':
        return { ...state, status: 'generating_feedback' };
    case 'FEEDBACK_GENERATED':
        return { ...state, status: 'complete', feedback: action.payload.feedback, bodyLanguageFeedback: action.payload.bodyLanguageFeedback };
    case 'RESET':
      return initialState;
    case 'SET_ERROR':
      return { ...state, error: action.payload, status: 'idle' };
    default:
      return state;
  }
}

const InterviewStateContext = createContext<InterviewState | undefined>(undefined);
const InterviewDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  return (
    <InterviewStateContext.Provider value={state}>
      <InterviewDispatchContext.Provider value={dispatch}>
        {children}
      </InterviewDispatchContext.Provider>
    </InterviewStateContext.Provider>
  );
}

export function useInterviewState() {
  const context = useContext(InterviewStateContext);
  if (context === undefined) {
    throw new Error('useInterviewState must be used within an InterviewProvider');
  }
  return context;
}

export function useInterviewDispatch() {
  const context = useContext(InterviewDispatchContext);
  if (context === undefined) {
    throw new Error('useInterviewDispatch must be used within an InterviewProvider');
  }
  return context;
}
