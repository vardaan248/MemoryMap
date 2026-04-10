import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.get('/', requireAuth, (_req, res) => res.json({ trips: [], message: 'Coming in Phase 2' }));
router.post('/', requireAuth, (_req, res) => res.status(201).json({ message: 'Coming in Phase 2' }));
router.get('/:id', requireAuth, (_req, res) => res.json({ message: 'Coming in Phase 2' }));
router.patch('/:id', requireAuth, (_req, res) => res.json({ message: 'Coming in Phase 2' }));
router.delete('/:id', requireAuth, (_req, res) => res.json({ message: 'Coming in Phase 2' }));

export default router;
