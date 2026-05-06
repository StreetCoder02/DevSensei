/**
 * Controller for Mock Interview endpoints.
 */

import type { RequestHandler } from 'express';
import { generateJSON } from '../services/gemini.service';
import { prompts } from '../prompts';
import { InterviewRequestSchema, InterviewResponseSchema } from '../../shared/schemas';
import { logger } from '../utils/helpers';

function buildFallbackInterviewResponse(turnCount: number) {
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
        strengths: [
          'Communicated ideas clearly',
          'Showed practical problem-solving approach',
        ],
        improvements: [
          'Add more measurable impact in examples',
          'Go deeper on trade-offs and edge cases',
        ],
        verdict: 'Good foundational performance. With sharper technical depth, you can perform strongly in real interviews.',
      },
    };
  }

  return {
    interviewerMessage: fallbackQuestions[Math.max(0, turnCount)],
    isComplete: false,
  };
}

export const performInterviewTurn: RequestHandler = async (req, res) => {
  try {
    const validation = InterviewRequestSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn('Interview request validation failed');
      return res.status(400).json({ message: 'Invalid interview request.' });
    }

    const { config, messages, userAnswer, turnCount } = validation.data;
    let prompt = '';

    if (messages.length === 0) {
      // Start interview
      prompt = prompts.mockInterviewStart(config.role, config.difficulty, config.topic);
    } else if (turnCount < 5) {
      // Continue interview
      const history = messages
        .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
        .join('\n');
      prompt = prompts.mockInterviewContinue(config.role, config.difficulty, config.topic, history, userAnswer, turnCount);
    } else {
      // End interview
      const history = messages
        .map((m) => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
        .join('\n');
      prompt = prompts.mockInterviewEnd(config.role, config.difficulty, config.topic, history, userAnswer);
    }

    const data = await generateJSON(prompt, buildFallbackInterviewResponse(turnCount));

    const resultValidation = InterviewResponseSchema.safeParse(data);
    if (!resultValidation.success) {
      logger.warn('Interview response validation failed');
      return res.status(200).json(buildFallbackInterviewResponse(turnCount));
    }

    res.status(200).json(resultValidation.data);
  } catch (error) {
    logger.error('Mock interview error', error);
    res.status(500).json({ message: 'Failed to process interview turn.' });
  }
};
