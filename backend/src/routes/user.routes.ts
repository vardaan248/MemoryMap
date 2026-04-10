import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// GET /api/v1/users/:id  — public profile
router.get('/:id', (_req, res) => res.json({ message: 'User profile — coming in Phase 2' }));

// PATCH /api/v1/users/me — update profile
router.patch('/me', requireAuth, (_req, res) =>
  res.json({ message: 'Update profile — coming in Phase 2' })
);

export default router;
