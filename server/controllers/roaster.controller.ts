/**
 * Controller for Code Roaster endpoints.
 */

import type { RequestHandler } from 'express';
import { generateJSON } from '../services/gemini.service';
import { prompts } from '../prompts';
import { RoastRequestSchema, RoastResultSchema } from '../../shared/schemas';
import { logger, validateQueryParam } from '../utils/helpers';

const ALLOWED_LANGUAGES = ['javascript', 'python', 'java', 'cpp'];

export const roastCode: RequestHandler = async (req, res) => {
  try {
    const validation = RoastRequestSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn('Roast request validation failed');
      return res.status(400).json({ message: 'Missing code or language.' });
    }

    const { language, code, mode } = validation.data;
    const normalizedLang = validateQueryParam(language, ALLOWED_LANGUAGES, 'javascript');

    const prompt = mode === 'roast'
      ? prompts.roastCode(normalizedLang, code)
      : prompts.mentorCode(normalizedLang, code);

    const data = await generateJSON(prompt, {
      roastText: 'Unable to review code.',
      roastLevel: 1,
      fixedCode: code,
      whyBetter: 'Please try a simpler code snippet.',
    });

    const resultValidation = RoastResultSchema.safeParse(data);
    if (!resultValidation.success) {
      logger.warn('Roast result validation failed');
      return res.status(200).json({
        roastText: 'Unable to review code.',
        roastLevel: 1,
        fixedCode: code,
        whyBetter: 'Please try a simpler code snippet.',
      });
    }

    res.status(200).json(resultValidation.data);
  } catch (error) {
    logger.error('Code roast error', error);
    res.status(500).json({ message: 'Failed to roast code. Please try again later.' });
  }
};
