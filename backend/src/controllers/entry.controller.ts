import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/ApiError';

const parseCoordinate = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
};

// ── List entries for a trip ───────────────────────────
export const getEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { tripId } = req.params;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new ApiError(404, 'Trip not found.');

    const entries = await prisma.entry.findMany({
      where: { tripId },
      orderBy: { date: 'asc' },
      include: { photos: { orderBy: { order: 'asc' } } },
    });

    res.json({ entries });
  } catch (err) {
    next(err);
  }
};

// ── Get single entry ──────────────────────────────────
export const getEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { tripId, id } = req.params;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new ApiError(404, 'Trip not found.');

    const entry = await prisma.entry.findFirst({
      where: { id, tripId },
      include: { photos: { orderBy: { order: 'asc' } } },
    });

    if (!entry) throw new ApiError(404, 'Entry not found.');
    res.json({ entry });
  } catch (err) {
    next(err);
  }
};

// ── Create entry ──────────────────────────────────────
export const createEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { tripId } = req.params;
    const { title, content, date, mood, weather, locationName, country, city, latitude, longitude } = req.body;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new ApiError(404, 'Trip not found.');

    // Get current max order
    const lastEntry = await prisma.entry.findFirst({
      where: { tripId },
      orderBy: { order: 'desc' },
    });

    const parsedLatitude = parseCoordinate(latitude);
    const parsedLongitude = parseCoordinate(longitude);

    const entry = await prisma.entry.create({
      data: {
        tripId,
        title,
        content: content ?? {},
        date: new Date(date),
        mood,
        weather,
        locationName,
        country,
        city,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        order: (lastEntry?.order ?? -1) + 1,
      },
      include: { photos: true },
    });

    // Update trip entry count & countries list
    const countries = trip.countries ?? [];
    if (country && !countries.includes(country)) {
      countries.push(country);
    }

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        entryCount: { increment: 1 },
        countries,
        ...(city && !trip.cities.includes(city) ? { cities: { push: city } } : {}),
      },
    });

    // Update user country count
    if (country) {
      const userTrips = await prisma.trip.findMany({
        where: { userId },
        select: { countries: true },
      });
      const allCountries = new Set(userTrips.flatMap((t) => t.countries));
      await prisma.user.update({
        where: { id: userId },
        data: { totalCountries: allCountries.size },
      });
    }

    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
};

// ── Update entry ──────────────────────────────────────
export const updateEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { tripId, id } = req.params;
    const { title, content, date, mood, weather, locationName, country, city, latitude, longitude } = req.body;

    const parsedLatitude = parseCoordinate(latitude);
    const parsedLongitude = parseCoordinate(longitude);

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new ApiError(404, 'Trip not found.');

    const existing = await prisma.entry.findFirst({ where: { id, tripId } });
    if (!existing) throw new ApiError(404, 'Entry not found.');

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(date && { date: new Date(date) }),
        ...(mood !== undefined && { mood }),
        ...(weather !== undefined && { weather }),
        ...(locationName !== undefined && { locationName }),
        ...(country !== undefined && { country }),
        ...(city !== undefined && { city }),
        ...(latitude !== undefined && { latitude: parsedLatitude }),
        ...(longitude !== undefined && { longitude: parsedLongitude }),
      },
      include: { photos: { orderBy: { order: 'asc' } } },
    });

    res.json({ entry });
  } catch (err) {
    next(err);
  }
};

// ── Delete entry ──────────────────────────────────────
export const deleteEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const { tripId, id } = req.params;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new ApiError(404, 'Trip not found.');

    const entry = await prisma.entry.findFirst({ where: { id, tripId } });
    if (!entry) throw new ApiError(404, 'Entry not found.');

    await prisma.entry.delete({ where: { id } });

    await prisma.trip.update({
      where: { id: tripId },
      data: { entryCount: { decrement: 1 } },
    });

    res.json({ message: 'Entry deleted.' });
  } catch (err) {
    next(err);
  }
};
