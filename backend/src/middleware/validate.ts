import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const grouped: Record<string, string[]> = {};
    for (const err of errors.array()) {
      const field = (err as any).path ?? 'general';
      if (!grouped[field]) grouped[field] = [];
      grouped[field].push(err.msg);
    }
    return next(new ApiError(422, 'Validation failed.', grouped));
  }
  next();
};
