/**
 * Zod validation schemas for API request/response validation.
 * Provides runtime type checking and clear error messages.
 */

import { z } from 'zod';

// ─── Riddles ───
export const RiddlesResponseSchema = z.object({
  riddles: z.array(
    z.object({
      id: z.string().min(1),
      question: z.string().min(5),
      answer: z.string().min(1),
    })
  ).min(1),
});

// ─── Coding Questions ───
export const CodingQuestionResponseSchema = z.object({
  question: z.object({
    id: z.string().min(1),
    title: z.string().min(5),
    description: z.string().min(10),
    language: z.string().min(1),
    functionSignature: z.string().min(1),
    starterCode: z.string().min(1),
    algorithmHint: z.string().optional(),
  }),
});

export const CodingCheckRequestSchema = z.object({
  language: z.string().min(1).max(50),
  userCode: z.string().min(1).max(50000),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
});

export const CodingCheckResultSchema = z.object({
  passed: z.boolean(),
  feedback: z.string().min(1),
});

// ─── Quiz ───
export const QuizResponseSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().min(1),
      question: z.string().min(5),
      options: z.array(z.string()).length(4),
      correctIndex: z.number().int().min(0).max(3),
      explanation: z.string().min(1),
    })
  ).min(1),
});

// ─── Error Explainer ───
export const ErrorExplainRequestSchema = z.object({
  language: z.string().min(1).max(50),
  errorMessage: z.string().min(1).max(2000),
  codeContext: z.string().max(10000).optional(),
});

export const ErrorExplainResultSchema = z.object({
  whatWentWrong: z.string().min(1),
  howToFix: z.string().min(1),
  commonCause: z.string().min(1),
});

// ─── Mock Interview ───
export const InterviewRequestSchema = z.object({
  config: z.object({
    role: z.string().min(1).max(100),
    difficulty: z.string().min(1).max(100),
    topic: z.string().min(1).max(100),
  }),
  messages: z.array(
    z.object({
      role: z.enum(['interviewer', 'user']),
      content: z.string().min(1),
    })
  ).max(20),
  userAnswer: z.string().max(5000),
  turnCount: z.number().int().min(0).max(10),
});

export const InterviewResponseSchema = z.object({
  interviewerMessage: z.string().min(1),
  isComplete: z.boolean(),
  feedback: z
    .object({
      score: z.number().min(0).max(10),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
      verdict: z.string().min(1),
    })
    .optional(),
});

// ─── Code Roaster ───
export const RoastRequestSchema = z.object({
  language: z.string().min(1).max(50),
  code: z.string().min(1).max(50000),
  mode: z.enum(['roast', 'mentor']),
});

export const RoastResultSchema = z.object({
  roastText: z.string().min(1),
  roastLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  fixedCode: z.string().min(1),
  whyBetter: z.string().min(1),
});
