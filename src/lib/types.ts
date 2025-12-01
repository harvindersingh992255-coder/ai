export type Plan = 'Basic' | 'Premium' | 'Super Pack';

export type User = {
    name: string;
    avatarUrl: string;
};

export type InterviewSettings = {
  dreamCompany: string;
  industry: string;
  jobRole: string;
  interviewType: 'behavioral' | 'technical' | 'general';
  difficulty: number;
  experienceLevel: number;
  focusSkills?: string;
  numQuestions: number;
};

export type InterviewQuestion = {
  question: string;
  answerTranscript: string | null;
  videoUrl: string | null;
};

export type AIFeedback = {
  overallScore: number;
  clarityAndConciseness: {
    score: number;
    feedback: string;
  };
  contentRelevance: {
    score: number;
    feedback: string;
  };
  starMethodUsage: {
    score: number;
    feedback: string;
  };
  impactAndResults: {
    score: number;
    feedback: string;
  };
  recommendations: string;
};

export type BodyLanguageFeedback = {
  confidenceScore: number;
  confidenceFeedback: string;
  postureScore: number;
  postureFeedback: string;
  eyeContactScore: number;
  eyeContactFeedback: string;
  overallAnalysis: string;
};

export type InterviewSession = {
  id: string;
  date: string;
  settings: InterviewSettings;
  questions: InterviewQuestion[];
  feedback: (AIFeedback | null)[];
  bodyLanguageFeedback: (BodyLanguageFeedback | null)[];
  overallScore: number;
};
