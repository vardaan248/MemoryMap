import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import * as tripController from '../controllers/trip.controller';

const router = Router();

// Public — get trip by share slug (no auth)
router.get('/share/:slug', tripController.getTripBySlug);

// All routes below require auth
router.use(requireAuth);

router.get('/', tripController.getTrips);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Trip title is required.'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date.'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date.'),
  ],
  validate,
  tripController.createTrip
);

router.get('/:id', tripController.getTrip);

router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('status').optional().isIn(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
    body('isPublic').optional().isBoolean(),
  ],
  validate,
  tripController.updateTrip
);

router.delete('/:id', tripController.deleteTrip);

export default router;
