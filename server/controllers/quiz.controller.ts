/**
 * Controller for Quiz endpoints.
 */

import type { RequestHandler } from 'express';
import { generateJSON } from '../services/gemini.service';
import { prompts } from '../prompts';
import { QuizResponseSchema } from '../../shared/schemas';
import { logger } from '../utils/helpers';

const FALLBACK_QUIZ = {
  questions: [
    {
      id: 'quiz-001',
      question: 'What is the time complexity of binary search on a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
      explanation:
        'Binary search halves the search space every step, so it takes logarithmic time.',
    },
    {
      id: 'quiz-002',
      question: 'Which data structure follows LIFO (Last In, First Out)?',
      options: ['Queue', 'Stack', 'Heap', 'Linked List'],
      correctIndex: 1,
      explanation:
        'A stack follows Last In, First Out behavior. The most recently added item is removed first.',
    },
    {
      id: 'quiz-003',
      question: 'Which keyword is used to define a constant in JavaScript?',
      options: ['var', 'let', 'const', 'static'],
      correctIndex: 2,
      explanation:
        'const creates a block-scoped binding that cannot be reassigned.',
    },
    {
      id: 'quiz-004',
      question: 'What does HTTP status code 404 mean?',
      options: ['Server error', 'Unauthorized', 'Not Found', 'Success'],
      correctIndex: 2,
      explanation:
        '404 indicates that the requested resource could not be found on the server.',
    },
    {
      id: 'quiz-005',
      question: 'Which sorting algorithm has average-case O(n log n) complexity?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      correctIndex: 2,
      explanation:
        'Merge Sort consistently splits and merges, giving O(n log n) average and worst-case complexity.',
    },
  ],
};

export const getQuiz: RequestHandler = async (_req, res) => {
  try {
    const data = await generateJSON(prompts.quiz(), FALLBACK_QUIZ);

    const validated = QuizResponseSchema.safeParse(data);
    if (!validated.success) {
      logger.warn('Quiz response validation failed');
      return res.status(200).json(FALLBACK_QUIZ);
    }

    res.status(200).json(validated.data);
  } catch (error) {
    logger.error('Quiz error', error);
    res.status(500).json({ message: 'Failed to generate quiz. Please try again later.' });
  }
};
