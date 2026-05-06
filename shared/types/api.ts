/**
 * Shared TypeScript interfaces for frontend/backend API contracts.
 * Ensures type safety across the entire application.
 */

// ─── Riddles ───
export interface Riddle {
  id: string;
  question: string;
  answer: string;
}

export interface RiddlesResponse {
  riddles: Riddle[];
}

// ─── Coding Questions ───
export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  language: string;
  functionSignature: string;
  starterCode: string;
  algorithmHint?: string;
}

export interface CodingQuestionResponse {
  question: CodingQuestion;
}

export interface CodingCheckRequestBody {
  language: string;
  userCode: string;
  title: string;
  description: string;
}

export interface CodingCheckResult {
  passed: boolean;
  feedback: string;
}

// ─── Quiz ───
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

// ─── Error Explainer ───
export interface ErrorExplainRequest {
  language: string;
  errorMessage: string;
  codeContext?: string;
}

export interface ErrorExplainResult {
  whatWentWrong: string;
  howToFix: string;
  commonCause: string;
}

// ─── Mock Interview ───
export interface InterviewMessage {
  role: 'interviewer' | 'user';
  content: string;
}

export interface InterviewConfig {
  role: string;
  difficulty: string;
  topic: string;
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  verdict: string;
}

export interface InterviewResponse {
  interviewerMessage: string;
  isComplete: boolean;
  feedback?: InterviewFeedback;
}

export interface InterviewRequest {
  config: InterviewConfig;
  messages: InterviewMessage[];
  userAnswer: string;
  turnCount: number;
}

// ─── Code Roaster ───
export interface RoastRequest {
  language: string;
  code: string;
  mode: 'roast' | 'mentor';
}

export interface RoastResult {
  roastText: string;
  roastLevel: 1 | 2 | 3;
  fixedCode: string;
  whyBetter: string;
}

// ─── API Error Response ───
export interface ApiErrorResponse {
  message: string;
  error?: string;
  status?: number;
}
