import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { getConfig } from './config';
import { corsHeaders, errorHandler, requestLogger, validateContentType, asyncHandler } from './middleware';
import { getRiddles } from './controllers/riddles.controller';
import { getCodingQuestion, checkCodingAnswer } from './controllers/coding.controller';
import { getQuiz } from './controllers/quiz.controller';
import { explainError } from './controllers/errorExplainer.controller';
import { performInterviewTurn } from './controllers/interview.controller';
import { roastCode } from './controllers/roaster.controller';
import { logger } from './utils/helpers';
import { healthCheck } from './services/gemini.service';

export function createServer() {
  const app = express();
  const config = getConfig();

  // ─── Middleware ───
  app.use(corsHeaders);
  app.use(requestLogger);
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(validateContentType);

  // ─── Rate Limiting ───
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: { message: 'Too many requests. Please try again later.' },
    skip: (req) => req.path === '/api/health' || req.path === '/api/ping',
  });
  app.use(limiter);

  // ─── Health & Info Routes ───
  app.get('/api/ping', (_req, res) => {
    res.json({ message: config.PING_MESSAGE });
  });

  app.get('/api/health', asyncHandler(async (_req, res) => {
    const geminiOk = await healthCheck();
    res.json({
      status: geminiOk ? 'ok' : 'degraded',
      gemini: geminiOk,
      timestamp: new Date().toISOString(),
      version: '2.0',
    });
  }));

  // ─── AI Feature Routes ───
  app.get('/api/riddles', asyncHandler(getRiddles));
  app.get('/api/coding-question', asyncHandler(getCodingQuestion));
  app.post('/api/coding-check', asyncHandler(checkCodingAnswer));
  app.get('/api/quiz', asyncHandler(getQuiz));
  app.post('/api/explain-error', asyncHandler(explainError));
  app.post('/api/mock-interview', asyncHandler(performInterviewTurn));
  app.post('/api/roast-code', asyncHandler(roastCode));

  // ─── 404 Handler ───
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    // In development, Vite handles SPA routing
    // In production, node-build.ts handles this
    // This middleware shouldn't reach non-API routes in normal operation
    res.status(404).json({ message: 'Not found' });
  });

  // ─── Error Handler (must be last) ───
  app.use(errorHandler);

  logger.info('✓ Express server configured');
  return app;
}
