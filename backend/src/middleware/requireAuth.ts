import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { ApiError } from '../utils/ApiError';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: Express.User) => {
    if (err) return next(err);
    if (!user) return next(new ApiError(401, 'Authentication required.'));
    req.user = user;
    next();
  })(req, res, next);
};
