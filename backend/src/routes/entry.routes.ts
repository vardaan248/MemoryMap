import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import * as entryController from '../controllers/entry.controller';

const router = Router({ mergeParams: true });

const locationCoordinatesPairValidator = (_value: unknown, meta: { req?: { body?: Record<string, unknown> } }) => {
  const body = meta.req?.body ?? {};
  const hasLat = body.latitude !== undefined && body.latitude !== null && body.latitude !== '';
  const hasLng = body.longitude !== undefined && body.longitude !== null && body.longitude !== '';

  if (hasLat !== hasLng) {
    throw new Error('Latitude and longitude must both be provided together.');
  }
  return true;
};

router.use(requireAuth);

router.get('/', entryController.getEntries);

router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Entry title is required.')
      .isLength({ max: 120 }).withMessage('Entry title must be 120 characters or less.'),
    body('date').isISO8601().withMessage('Valid date is required.'),
    body('content').optional().isObject().withMessage('Content must be a JSON object.'),
    body('mood').optional().isIn(['AMAZING', 'HAPPY', 'NEUTRAL', 'TIRED', 'CHALLENGED']),
    body('weather').optional().trim().isLength({ max: 80 }).withMessage('Weather must be 80 characters or less.'),
    body('locationName').optional().trim().isLength({ max: 180 }).withMessage('Location name must be 180 characters or less.'),
    body('city').optional().trim().isLength({ max: 80 }).withMessage('City must be 80 characters or less.'),
    body('country').optional().trim().isLength({ max: 80 }).withMessage('Country must be 80 characters or less.'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('longitude').custom(locationCoordinatesPairValidator),
  ],
  validate,
  entryController.createEntry
);

router.get('/:id', entryController.getEntry);
router.patch(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Entry title cannot be empty.')
      .isLength({ max: 120 }).withMessage('Entry title must be 120 characters or less.'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO date.'),
    body('content').optional().isObject().withMessage('Content must be a JSON object.'),
    body('mood').optional().isIn(['AMAZING', 'HAPPY', 'NEUTRAL', 'TIRED', 'CHALLENGED']),
    body('weather').optional().trim().isLength({ max: 80 }).withMessage('Weather must be 80 characters or less.'),
    body('locationName').optional().trim().isLength({ max: 180 }).withMessage('Location name must be 180 characters or less.'),
    body('city').optional().trim().isLength({ max: 80 }).withMessage('City must be 80 characters or less.'),
    body('country').optional().trim().isLength({ max: 80 }).withMessage('Country must be 80 characters or less.'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('longitude').custom(locationCoordinatesPairValidator),
  ],
  validate,
  entryController.updateEntry
);
router.delete('/:id', entryController.deleteEntry);

export default router;
