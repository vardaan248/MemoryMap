import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<{ url: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('Upload failed'));
          resolve({ url: result.secure_url, width: result.width, height: result.height });
        }
      )
      .end(buffer);
  });
};

// ── Upload photos to an entry ─────────────────────────
export const uploadPhotos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { entryId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files?.length) throw new ApiError(400, 'No files uploaded.');

    // Verify entry ownership
    const entry = await prisma.entry.findFirst({
      where: { id: entryId },
      include: { trip: true },
    });
    if (!entry || entry.trip.userId !== userId) throw new ApiError(404, 'Entry not found.');

    // Get current max order for photos
    const lastPhoto = await prisma.photo.findFirst({
      where: { entryId },
      orderBy: { order: 'desc' },
    });
    let orderCounter = (lastPhoto?.order ?? -1) + 1;

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const folder = `wanderlog/${userId}/${entry.tripId}`;
        const publicId = `${entryId}_${Date.now()}_${orderCounter}`;

        // Resize & optimise with Sharp before uploading
        const [originalBuffer, thumbBuffer] = await Promise.all([
          sharp(file.buffer)
            .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer(),
          sharp(file.buffer)
            .resize({ width: 400, height: 400, fit: 'cover' })
            .jpeg({ quality: 75 })
            .toBuffer(),
        ]);

        const [original, thumb] = await Promise.all([
          uploadToCloudinary(originalBuffer, folder, publicId),
          uploadToCloudinary(thumbBuffer, `${folder}/thumbs`, `${publicId}_thumb`),
        ]);

        const photo = await prisma.photo.create({
          data: {
            entryId,
            url: original.url,
            thumbnailUrl: thumb.url,
            width: original.width,
            height: original.height,
            order: orderCounter,
          },
        });

        orderCounter++;
        return photo;
      })
    );

    // Update photo count on trip
    await prisma.trip.update({
      where: { id: entry.tripId },
      data: { photoCount: { increment: uploaded.length } },
    });

    // Update user total photos
    await prisma.user.update({
      where: { id: userId },
      data: { totalPhotos: { increment: uploaded.length } },
    });

    res.status(201).json({ photos: uploaded });
  } catch (err) {
    next(err);
  }
};

// ── Set cover photo ───────────────────────────────────
export const setCoverPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { entryId, photoId } = req.params;

    const entry = await prisma.entry.findFirst({
      where: { id: entryId },
      include: { trip: true },
    });
    if (!entry || entry.trip.userId !== userId) throw new ApiError(404, 'Entry not found.');

    const photo = await prisma.photo.findFirst({ where: { id: photoId, entryId } });
    if (!photo) throw new ApiError(404, 'Photo not found.');

    // Set this photo's URL as trip cover if entry is the first
    await prisma.trip.update({
      where: { id: entry.tripId },
      data: { coverImage: photo.url },
    });

    res.json({ message: 'Cover photo updated.', photo });
  } catch (err) {
    next(err);
  }
};

// ── Delete photo ──────────────────────────────────────
export const deletePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { entryId, photoId } = req.params;

    const entry = await prisma.entry.findFirst({
      where: { id: entryId },
      include: { trip: true },
    });
    if (!entry || entry.trip.userId !== userId) throw new ApiError(404, 'Entry not found.');

    const photo = await prisma.photo.findFirst({ where: { id: photoId, entryId } });
    if (!photo) throw new ApiError(404, 'Photo not found.');

    // Extract Cloudinary public_id from URL and delete
    const urlParts = photo.url.split('/');
    const publicId = urlParts.slice(-2).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(`wanderlog/${userId}/${entry.tripId}/${publicId}`).catch(() => {});

    await prisma.photo.delete({ where: { id: photoId } });

    await prisma.trip.update({
      where: { id: entry.tripId },
      data: { photoCount: { decrement: 1 } },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalPhotos: { decrement: 1 } },
    });

    res.json({ message: 'Photo deleted.' });
  } catch (err) {
    next(err);
  }
};

// ── Reorder photos ────────────────────────────────────
export const reorderPhotos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { entryId } = req.params;
    const { photoIds } = req.body; // ordered array of photo IDs

    const entry = await prisma.entry.findFirst({
      where: { id: entryId },
      include: { trip: true },
    });
    if (!entry || entry.trip.userId !== userId) throw new ApiError(404, 'Entry not found.');

    await Promise.all(
      (photoIds as string[]).map((id, index) =>
        prisma.photo.update({ where: { id }, data: { order: index } })
      )
    );

    res.json({ message: 'Photos reordered.' });
  } catch (err) {
    next(err);
  }
};
