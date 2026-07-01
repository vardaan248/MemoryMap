import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as geoController from '../controllers/geo.controller';

const router = Router();

router.use(requireAuth);

router.get('/pins',      geoController.getPins);
router.get('/countries', geoController.getCountries);
router.get('/stats',     geoController.getStats);

export default router;
