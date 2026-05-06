/**
 * Express middleware for error handling and request validation.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/helpers';

/**
 * Global error handling middleware.
 * Catches errors from all routes and returns consistent error responses.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Unhandled error', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
}

/**
 * CORS headers middleware.
 */
export function corsHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

/**
 * Request logging middleware.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

/**
 * Validate JSON content type for POST/PUT requests.
 */
export function validateContentType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ message: 'Content-Type must be application/json' });
    }
  }
  next();
}

/**
 * Request body size limit middleware (prevent abuse).
 */
export function requestSizeLimit(maxBytes: number = 1024 * 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        res.status(413).json({ message: 'Payload too large' });
        req.destroy();
      }
    });
    next();
  };
}

/**
 * Async error wrapper for Express handlers.
 * Wraps async route handlers to catch Promise rejections.
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
