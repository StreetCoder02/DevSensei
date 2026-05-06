import { generateJSON, healthCheck } from '../server/services/gemini.service';
import { prompts } from '../server/prompts';
import {
  CodingCheckRequestSchema,
  CodingCheckResultSchema,
  CodingQuestionResponseSchema,
  ErrorExplainRequestSchema,
  ErrorExplainResultSchema,
  InterviewRequestSchema,
  InterviewResponseSchema,
  QuizResponseSchema,
  RoastRequestSchema,
  RoastResultSchema,
  RiddlesResponseSchema,
} from '../shared/schemas';
import { logger, validateQueryParam } from '../server/utils/helpers';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const ALLOWED_LANGUAGES = ['javascript', 'python', 'java', 'cpp'];
const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'];

const FALLBACK_RIDDLES = {
  riddles: [
    { id: 'riddle-001', question: 'What has cities, but no houses; forests, but no trees; and water, but no fish?', answer: 'A map' },
    { id: 'riddle-002', question: 'What is full of holes but still holds water?', answer: 'A sponge' },
    { id: 'riddle-003', question: 'What has to be broken before you can use it?', answer: 'An egg' },
    { id: 'riddle-004', question: 'The more you take, the more you leave behind. What are they?', answer: 'Footsteps' },
    { id: 'riddle-005', question: 'What can run but never walks, has a mouth but never talks?', answer: 'A river' },
  ],
};

const FALLBACK_QUIZ = {
  questions: [
    {
      id: 'quiz-001',
      question: 'What is the time complexity of binary search on a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
      explanation: 'Binary search halves the search space every step, so it takes logarithmic time.',
    },
    { id: 'quiz-002', question: 'Which data structure follows LIFO (Last In, First Out)?', options: ['Queue', 'Stack', 'Heap', 'Linked List'], correctIndex: 1, explanation: 'A stack follows Last In, First Out behavior.' },
    { id: 'quiz-003', question: 'Which keyword is used to define a constant in JavaScript?', options: ['var', 'let', 'const', 'static'], correctIndex: 2, explanation: 'const creates a block-scoped binding that cannot be reassigned.' },
    { id: 'quiz-004', question: 'What does HTTP status code 404 mean?', options: ['Server error', 'Unauthorized', 'Not Found', 'Success'], correctIndex: 2, explanation: '404 indicates that the requested resource could not be found on the server.' },
    { id: 'quiz-005', question: 'Which sorting algorithm has average-case O(n log n) complexity?', options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], correctIndex: 2, explanation: 'Merge Sort consistently splits and merges, giving O(n log n) average and worst-case complexity.' },
  ],
};

const FALLBACK_CODING_QUESTION = {
  question: {
    id: 'coding-fallback-001',
    title: 'Find the Maximum Value',
    description: 'Given an array of numbers, return the largest number in the array. If the array is empty, return null.',
    language: 'javascript',
    functionSignature: 'function findMax(arr) {',
    starterCode: 'function findMax(arr) {\n  // TODO: return the largest value in arr\n}',
    algorithmHint: 'none',
  },
};

const FALLBACK_ERROR = {
  whatWentWrong: 'Unable to analyze this error.',
  howToFix: 'Please try a simpler error message.',
  commonCause: 'Try rephrasing your error message.',
};

function buildInterviewFallback(turnCount: number) {
  const fallbackQuestions = [
    'Tell me about yourself and why you are interested in this role.',
    'Explain a project where you solved a difficult technical problem.',
    'How would you optimize a slow API endpoint used by many users?',
    'Describe a bug you faced recently and how you debugged it step by step.',
    'What are your strengths and one area you are actively improving?',
  ];

  if (turnCount >= 5) {
    return {
      interviewerMessage: 'Thank you for your time. That concludes the interview.',
      isComplete: true,
      feedback: {
        score: 7,
        strengths: ['Communicated ideas clearly', 'Showed practical problem-solving approach'],
        improvements: ['Add more measurable impact in examples', 'Go deeper on trade-offs and edge cases'],
        verdict: 'Good foundational performance. With sharper technical depth, you can perform strongly in real interviews.',
      },
    };
  }

  return { interviewerMessage: fallbackQuestions[Math.max(0, turnCount)], isComplete: false };
}

function parseBody(body: any) {
  if (!body) return null;
  return typeof body === 'string' ? JSON.parse(body) : body;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  try {
    const path = req.url || req.path || '';
    const method = req.method;

    if (path === '/api/ping' || path.endsWith('/ping')) {
      return res.status(200).json({ message: process.env.PING_MESSAGE || 'ping' });
    }

    if (path === '/api/health' || path.endsWith('/health')) {
      const geminiOk = await healthCheck();
      return res.status(200).json({ status: geminiOk ? 'ok' : 'degraded', gemini: geminiOk, timestamp: new Date().toISOString(), version: '2.0' });
    }

    if (path === '/api/riddles' || path.endsWith('/riddles')) {
      const data = await generateJSON(prompts.riddles(), FALLBACK_RIDDLES);
      const validated = RiddlesResponseSchema.safeParse(data);
      return res.status(200).json(validated.success ? validated.data : FALLBACK_RIDDLES);
    }

    if (path.includes('/coding-question')) {
      const language = validateQueryParam(req.query?.language, ALLOWED_LANGUAGES, 'javascript');
      const difficulty = validateQueryParam(req.query?.difficulty, ALLOWED_DIFFICULTIES, 'easy');
      const data = await generateJSON(prompts.codingQuestion(language, difficulty), FALLBACK_CODING_QUESTION);
      const validated = CodingQuestionResponseSchema.safeParse(data);
      return res.status(200).json(validated.success ? validated.data : FALLBACK_CODING_QUESTION);
    }

    if (path.includes('/coding-check') && method === 'POST') {
      const parsedBody = parseBody(req.body);
      const validation = CodingCheckRequestSchema.safeParse(parsedBody);
      if (!validation.success) {
        return res.status(400).json({ message: 'Missing or invalid code, title, or description.' });
      }

      const { language, title, description, userCode } = validation.data;
      const data = await generateJSON(prompts.codingCheck(language, title, description, userCode), { passed: false, feedback: 'Unable to evaluate code. Please try again.' });
      const resultValidation = CodingCheckResultSchema.safeParse(data);
      return res.status(200).json(resultValidation.success ? resultValidation.data : { passed: false, feedback: 'Unable to evaluate code. Please try again.' });
    }

    if (path === '/api/quiz' || path.endsWith('/quiz')) {
      const data = await generateJSON(prompts.quiz(), FALLBACK_QUIZ);
      const validated = QuizResponseSchema.safeParse(data);
      return res.status(200).json(validated.success ? validated.data : FALLBACK_QUIZ);
    }

    if (path.includes('/explain-error') && method === 'POST') {
      const parsedBody = parseBody(req.body);
      const validation = ErrorExplainRequestSchema.safeParse(parsedBody);
      if (!validation.success) {
        return res.status(400).json({ message: 'Missing error message.' });
      }

      const { language, errorMessage, codeContext } = validation.data;
      const data = await generateJSON(prompts.errorExplain(language, errorMessage, codeContext), FALLBACK_ERROR);
      const resultValidation = ErrorExplainResultSchema.safeParse(data);
      return res.status(200).json(resultValidation.success ? resultValidation.data : FALLBACK_ERROR);
    }

    if (path.includes('/mock-interview') && method === 'POST') {
      const parsedBody = parseBody(req.body);
      const validation = InterviewRequestSchema.safeParse(parsedBody);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid interview request.' });
      }

      const { config, messages, userAnswer, turnCount } = validation.data;
      let prompt = '';

      if (messages.length === 0) {
        prompt = prompts.mockInterviewStart(config.role, config.difficulty, config.topic);
      } else if (turnCount < 5) {
        const history = messages.map((m: any) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n');
        prompt = prompts.mockInterviewContinue(config.role, config.difficulty, config.topic, history, userAnswer, turnCount);
      } else {
        const history = messages.map((m: any) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n');
        prompt = prompts.mockInterviewEnd(config.role, config.difficulty, config.topic, history, userAnswer);
      }

      const data = await generateJSON(prompt, buildInterviewFallback(turnCount));
      const resultValidation = InterviewResponseSchema.safeParse(data);
      return res.status(200).json(resultValidation.success ? resultValidation.data : buildInterviewFallback(turnCount));
    }

    if (path.includes('/roast-code') && method === 'POST') {
      const parsedBody = parseBody(req.body);
      const validation = RoastRequestSchema.safeParse(parsedBody);
      if (!validation.success) {
        return res.status(400).json({ message: 'Missing code or language.' });
      }

      const { language, code, mode } = validation.data;
      const normalizedLanguage = validateQueryParam(language, ALLOWED_LANGUAGES, 'javascript');
      const prompt = mode === 'roast' ? prompts.roastCode(normalizedLanguage, code) : prompts.mentorCode(normalizedLanguage, code);

      const data = await generateJSON(prompt, { roastText: 'Unable to review code.', roastLevel: 1, fixedCode: code, whyBetter: 'Please try a simpler code snippet.' });
      const resultValidation = RoastResultSchema.safeParse(data);
      return res.status(200).json(resultValidation.success ? resultValidation.data : { roastText: 'Unable to review code.', roastLevel: 1, fixedCode: code, whyBetter: 'Please try a simpler code snippet.' });
    }

    return res.status(404).json({ error: 'API endpoint not found' });
  } catch (error) {
    logger.error('Vercel API error', error);
    return res.status(500).json({ message: 'Internal server error', ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : String(error) }) });
  }
}
