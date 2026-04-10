import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { config } from '../config';

// ── Global Error Handler ──────────────────────────────
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Prisma unique constraint violation
  if ((err as any).code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }

  // JWT errors (caught by passport, but just in case)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired.' });
  }

  // Unexpected errors
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'An unexpected error occurred.',
    ...(config.isDev && { detail: err.message, stack: err.stack }),
  });
};

// ── 404 Handler ───────────────────────────────────────
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
};
