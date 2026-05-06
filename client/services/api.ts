/**
 * Frontend API client for all backend requests.
 * Centralizes fetch logic, error handling, and response parsing.
 */

import type {
  RiddlesResponse,
  CodingQuestionResponse,
  CodingCheckRequestBody,
  CodingCheckResult,
  QuizResponse,
  ErrorExplainRequest,
  ErrorExplainResult,
  InterviewRequest,
  InterviewResponse,
  RoastRequest,
  RoastResult,
  ApiErrorResponse,
} from '@shared/types/api';

const BASE_URL = '';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with error handling.
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorResponse = data as ApiErrorResponse | null;
      throw new ApiError(
        errorResponse?.message || `HTTP ${response.status}`,
        response.status,
        errorResponse
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to fetch from API',
      500
    );
  }
}

/**
 * API client methods for all features.
 */
export const api = {
  // Health & info
  ping: () => fetchAPI<{ message: string }>('/api/ping'),

  health: () =>
    fetchAPI<{
      status: string;
      gemini: boolean;
      timestamp: string;
      version: string;
    }>('/api/health'),

  // Riddles
  getRiddles: () => fetchAPI<RiddlesResponse>('/api/riddles'),

  // Coding challenges
  getCodingQuestion: (language: string, difficulty: string) =>
    fetchAPI<CodingQuestionResponse>(
      `/api/coding-question?language=${encodeURIComponent(language)}&difficulty=${encodeURIComponent(difficulty)}`
    ),

  checkCodingAnswer: (body: CodingCheckRequestBody) =>
    fetchAPI<CodingCheckResult>('/api/coding-check', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Quiz
  getQuiz: () => fetchAPI<QuizResponse>('/api/quiz'),

  // Error explainer
  explainError: (body: ErrorExplainRequest) =>
    fetchAPI<ErrorExplainResult>('/api/explain-error', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Mock interview
  performInterviewTurn: (body: InterviewRequest) =>
    fetchAPI<InterviewResponse>('/api/mock-interview', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Code roaster
  roastCode: (body: RoastRequest) =>
    fetchAPI<RoastResult>('/api/roast-code', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// Export error class for client-side error handling
export { ApiError };
