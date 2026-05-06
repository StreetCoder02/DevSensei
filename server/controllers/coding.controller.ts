/**
 * Controller for Coding Challenge endpoints.
 */

import type { RequestHandler } from 'express';
import { generateJSON } from '../services/gemini.service';
import { prompts } from '../prompts';
import { CodingQuestionResponseSchema, CodingCheckRequestSchema, CodingCheckResultSchema } from '../../shared/schemas';
import { logger, validateQueryParam } from '../utils/helpers';

const ALLOWED_LANGUAGES = ['javascript', 'python', 'java', 'cpp'];
const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'];

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

export const getCodingQuestion: RequestHandler = async (req, res) => {
  try {
    const language = validateQueryParam(req.query.language as string, ALLOWED_LANGUAGES, 'javascript');
    const difficulty = validateQueryParam(req.query.difficulty as string, ALLOWED_DIFFICULTIES, 'easy');

    const data = await generateJSON(
      prompts.codingQuestion(language, difficulty),
      FALLBACK_CODING_QUESTION
    );

    const validated = CodingQuestionResponseSchema.safeParse(data);
    if (!validated.success) {
      logger.warn('Coding question response validation failed');
      return res.status(200).json(FALLBACK_CODING_QUESTION);
    }

    res.status(200).json(validated.data);
  } catch (error) {
    logger.error('Coding question error', error);
    res.status(500).json({ message: 'Failed to generate coding challenge. Try again.' });
  }
};

export const checkCodingAnswer: RequestHandler = async (req, res) => {
  try {
    const validation = CodingCheckRequestSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn('Coding check request validation failed', validation.error);
      return res.status(400).json({ message: 'Missing or invalid code, title, or description.' });
    }

    const { language, title, description, userCode } = validation.data;

    const data = await generateJSON(
      prompts.codingCheck(language, title, description, userCode),
      { passed: false, feedback: 'Unable to evaluate code. Please try again.' }
    );

    const resultValidation = CodingCheckResultSchema.safeParse(data);
    if (!resultValidation.success) {
      logger.warn('Coding check result validation failed');
      return res.status(200).json({ passed: false, feedback: 'Unable to evaluate code. Please try again.' });
    }

    res.status(200).json(resultValidation.data);
  } catch (error) {
    logger.error('Coding check error', error);
    res.status(500).json({ message: 'Failed to check code. Please try again later.' });
  }
};
