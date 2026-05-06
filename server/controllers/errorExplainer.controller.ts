/**
 * Controller for Error Explainer endpoints.
 */

import type { RequestHandler } from 'express';
import { generateJSON } from '../services/gemini.service';
import { prompts } from '../prompts';
import { ErrorExplainRequestSchema, ErrorExplainResultSchema } from '../../shared/schemas';
import { logger } from '../utils/helpers';

export const explainError: RequestHandler = async (req, res) => {
  try {
    const validation = ErrorExplainRequestSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn('Error explain request validation failed');
      return res.status(400).json({ message: 'Missing error message.' });
    }

    const { language, errorMessage, codeContext } = validation.data;

    const data = await generateJSON(
      prompts.errorExplain(language, errorMessage, codeContext),
      {
        whatWentWrong: 'Unable to analyze this error.',
        howToFix: 'Please try a simpler error message.',
        commonCause: 'Try rephrasing your error message.',
      }
    );

    const resultValidation = ErrorExplainResultSchema.safeParse(data);
    if (!resultValidation.success) {
      logger.warn('Error explain result validation failed');
      return res.status(200).json({
        whatWentWrong: 'Unable to analyze this error.',
        howToFix: 'Please try a simpler error message.',
        commonCause: 'Try rephrasing your error message.',
      });
    }

    res.status(200).json(resultValidation.data);
  } catch (error) {
    logger.error('Error explainer error', error);
    res.status(500).json({ message: 'Failed to explain the error. Please try again later.' });
  }
};
