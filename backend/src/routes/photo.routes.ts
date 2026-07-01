import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/requireAuth';
import * as photoController from '../controllers/photo.controller';

const router = Router({ mergeParams: true });
router.use(requireAuth);

// Multer — memory storage, 10MB per file, max 10 files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

router.post('/', upload.array('photos', 10), photoController.uploadPhotos);
router.patch('/reorder', photoController.reorderPhotos);
router.patch('/:photoId/cover', photoController.setCoverPhoto);
router.delete('/:photoId', photoController.deletePhoto);

export default router;
