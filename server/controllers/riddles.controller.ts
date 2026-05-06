/**
 * Controller for Riddle endpoints.
 * Handles riddle generation and response formatting.
 */

import type { RequestHandler } from 'express';
import { generateJSON } from '../services/gemini.service';
import { prompts } from '../prompts';
import { RiddlesResponseSchema } from '../../shared/schemas';
import { logger } from '../utils/helpers';

const FALLBACK_RIDDLES = {
  riddles: [
    {
      id: 'riddle-001',
      question: 'What has cities, but no houses; forests, but no trees; and water, but no fish?',
      answer: 'A map',
    },
    {
      id: 'riddle-002',
      question: 'What is full of holes but still holds water?',
      answer: 'A sponge',
    },
    {
      id: 'riddle-003',
      question: 'What has to be broken before you can use it?',
      answer: 'An egg',
    },
    {
      id: 'riddle-004',
      question: 'The more you take, the more you leave behind. What are they?',
      answer: 'Footsteps',
    },
    {
      id: 'riddle-005',
      question: 'What can run but never walks, has a mouth but never talks?',
      answer: 'A river',
    },
  ],
};

export const getRiddles: RequestHandler = async (_req, res) => {
  try {
    const data = await generateJSON(prompts.riddles(), FALLBACK_RIDDLES);

    // Validate response schema
    const validated = RiddlesResponseSchema.safeParse(data);
    if (!validated.success) {
      logger.warn('Riddles response validation failed', validated.error);
      return res.status(200).json(FALLBACK_RIDDLES);
    }

    res.status(200).json(validated.data);
  } catch (error) {
    logger.error('Riddles error', error);
    res.status(500).json({ message: 'Failed to generate riddles. Try again later.' });
  }
};
