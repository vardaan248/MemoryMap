import { Router } from 'express';
import * as shareController from '../controllers/share.controller';

const router = Router();

// All share routes are public — no requireAuth
router.get('/:slug',         shareController.getPublicTrip);
router.get('/:slug/og-meta', shareController.getOgMeta);
router.get('/:slug/check',   shareController.checkSlug);

export default router;
