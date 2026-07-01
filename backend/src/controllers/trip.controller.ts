import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slug';

// ── List all trips for current user ───────────────────
export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { status, page = '1', limit = '12' } = req.query;

    const where: any = { userId };
    if (status) where.status = status;

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          tags: { include: { tag: true } },
          _count: { select: { entries: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    res.json({
      trips,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get single trip ───────────────────────────────────
export const getTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
      include: {
        tags: { include: { tag: true } },
        entries: {
          orderBy: { date: 'asc' },
          include: {
            photos: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!trip) throw new ApiError(404, 'Trip not found.');
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

// ── Get trip by public slug (no auth required) ────────
export const getTripBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { slug, isPublic: true },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        entries: {
          orderBy: { date: 'asc' },
          include: { photos: { orderBy: { order: 'asc' } } },
        },
      },
    });

    if (!trip) throw new ApiError(404, 'Trip not found or is private.');
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

// ── Create trip ───────────────────────────────────────
export const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { title, description, startDate, endDate, tags = [] } = req.body;

    const slug = await generateSlug(title);

    const trip = await prisma.trip.create({
      data: {
        userId,
        title,
        description,
        slug,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        tags: {
          create: await Promise.all(
            tags.map(async (tagName: string) => {
              const tag = await prisma.tag.upsert({
                where: { name: tagName.toLowerCase() },
                update: {},
                create: { name: tagName.toLowerCase() },
              });
              return { tagId: tag.id };
            })
          ),
        },
      },
      include: { tags: { include: { tag: true } } },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: { totalTrips: { increment: 1 } },
    });

    res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
};

// ── Update trip ───────────────────────────────────────
export const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { id } = req.params;
    const { title, description, startDate, endDate, status, isPublic, coverImage, tags } = req.body;

    const existing = await prisma.trip.findFirst({ where: { id, userId } });
    if (!existing) throw new ApiError(404, 'Trip not found.');

    const updateData: any = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(status && { status }),
      ...(isPublic !== undefined && { isPublic }),
      ...(coverImage && { coverImage }),
    };

    // Recalculate totalDays if dates changed
    if (startDate && endDate) {
      const days = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      updateData.totalDays = days;
    }

    // Replace tags if provided
    if (tags) {
      await prisma.tripTag.deleteMany({ where: { tripId: id } });
      updateData.tags = {
        create: await Promise.all(
          tags.map(async (tagName: string) => {
            const tag = await prisma.tag.upsert({
              where: { name: tagName.toLowerCase() },
              update: {},
              create: { name: tagName.toLowerCase() },
            });
            return { tagId: tag.id };
          })
        ),
      };
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: { tags: { include: { tag: true } } },
    });

    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

// ── Delete trip ───────────────────────────────────────
export const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({ where: { id, userId } });
    if (!trip) throw new ApiError(404, 'Trip not found.');

    await prisma.trip.delete({ where: { id } });

    await prisma.user.update({
      where: { id: userId },
      data: { totalTrips: { decrement: 1 } },
    });

    res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
