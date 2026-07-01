import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';

// ── GET /share/:slug ──────────────────────────────────
// Public read-only trip — no auth required
export const getPublicTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { slug, isPublic: true },
      include: {
        user: {
          select: { name: true, avatarUrl: true, bio: true },
        },
        tags: { include: { tag: true } },
        entries: {
          orderBy: { date: 'asc' },
          include: {
            photos: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!trip) throw new ApiError(404, 'Trip not found or is private.');

    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

// ── GET /share/:slug/og-meta ──────────────────────────
// Returns OG meta tags for social sharing previews
export const getOgMeta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { slug, isPublic: true },
      include: {
        user: { select: { name: true } },
        entries: {
          take: 1,
          orderBy: { date: 'asc' },
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    if (!trip) throw new ApiError(404, 'Trip not found.');

    // Build description from trip data
    const parts: string[] = [];
    if (trip.startDate && trip.endDate) {
      const days = Math.ceil(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      parts.push(`${days} days`);
    }
    if (trip.countries.length) parts.push(trip.countries.join(', '));
    if (trip.entryCount) parts.push(`${trip.entryCount} entries`);

    const description =
      trip.description ||
      (parts.length ? parts.join(' · ') : `A travel journal by ${trip.user.name}`);

    // Best image: trip cover → first entry photo
    const image =
      trip.coverImage ||
      trip.entries[0]?.photos[0]?.url ||
      null;

    const shareUrl = `${process.env['CLIENT_URL']}/share/${slug}`;

    res.json({
      meta: {
        title: `${trip.title} — WanderLog`,
        description,
        image,
        url: shareUrl,
        type: 'article',
        author: trip.user.name,
        siteName: 'WanderLog',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /share/:slug/privacy ──────────────────────────
// Toggle public/private (requires auth — handled in trip controller)
// This endpoint just verifies the slug exists for the share modal
export const checkSlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const exists = await prisma.trip.findUnique({
      where: { slug },
      select: { isPublic: true, title: true },
    });
    if (!exists) throw new ApiError(404, 'Trip not found.');
    res.json({ isPublic: exists.isPublic, title: exists.title });
  } catch (err) {
    next(err);
  }
};
