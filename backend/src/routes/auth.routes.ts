import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';

import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// ── Email / Password ──────────────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
      .matches(/[0-9]/).withMessage('Password must contain a number.'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

// ── Token Management ──────────────────────────────────
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// ── Google OAuth ──────────────────────────────────────
router.get(
  '/google',
  authLimiter,
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failed' }),
  authController.googleCallback
);

router.get('/google/failed', (_req, res) => {
  res.status(401).json({ error: 'Google authentication failed.' });
});

// ── Current User ──────────────────────────────────────
router.get('/me', requireAuth, authController.getMe);

export default router;
