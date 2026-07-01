import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as timelineController from '../controllers/timeline.controller';

const router = Router();
router.use(requireAuth);

router.get('/',       timelineController.getTimeline);
router.get('/years',  timelineController.getYears);
router.get('/stats',  timelineController.getTimelineStats);

export default router;
