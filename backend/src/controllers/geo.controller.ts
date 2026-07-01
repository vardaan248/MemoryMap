import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// ── GET /geo/pins ─────────────────────────────────────
// All entries with coordinates for the current user
export const getPins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;

    const entries = await prisma.entry.findMany({
      where: {
        trip: { userId },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        title: true,
        date: true,
        mood: true,
        locationName: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        photos: {
          take: 1,
          orderBy: { order: 'asc' },
          select: { thumbnailUrl: true },
        },
        trip: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ pins: entries });
  } catch (err) {
    next(err);
  }
};

// ── GET /geo/countries ────────────────────────────────
// All unique countries visited by the current user
export const getCountries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;

    const trips = await prisma.trip.findMany({
      where: { userId },
      select: { countries: true },
    });

    const countrySet = new Set<string>();
    trips.forEach((t) => t.countries.forEach((c) => countrySet.add(c)));

    // Also pull from individual entries for accuracy
    const entries = await prisma.entry.findMany({
      where: { trip: { userId }, country: { not: null } },
      select: { country: true },
      distinct: ['country'],
    });
    entries.forEach((e) => { if (e.country) countrySet.add(e.country); });

    res.json({ countries: Array.from(countrySet).sort() });
  } catch (err) {
    next(err);
  }
};

// ── GET /geo/stats ────────────────────────────────────
// Aggregated travel statistics
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;

    const [user, trips, entries] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { totalTrips: true, totalCountries: true, totalPhotos: true },
      }),
      prisma.trip.findMany({
        where: { userId },
        select: { countries: true, cities: true, totalDays: true, status: true },
      }),
      prisma.entry.findMany({
        where: { trip: { userId } },
        select: { country: true, city: true, latitude: true, longitude: true },
      }),
    ]);

    const allCountries = new Set<string>();
    const allCities = new Set<string>();
    let totalDays = 0;

    trips.forEach((t) => {
      t.countries.forEach((c) => allCountries.add(c));
      t.cities.forEach((c) => allCities.add(c));
      totalDays += t.totalDays;
    });

    entries.forEach((e) => {
      if (e.country) allCountries.add(e.country);
      if (e.city) allCities.add(e.city);
    });

    const completedTrips = trips.filter((t) => t.status === 'COMPLETED').length;
    const pinnedEntries = entries.filter((e) => e.latitude && e.longitude).length;

    res.json({
      stats: {
        totalTrips: user?.totalTrips ?? 0,
        totalCountries: allCountries.size,
        totalCities: allCities.size,
        totalDays,
        totalPhotos: user?.totalPhotos ?? 0,
        completedTrips,
        pinnedEntries,
        countriesList: Array.from(allCountries).sort(),
        citiesList: Array.from(allCities).sort(),
      },
    });
  } catch (err) {
    next(err);
  }
};
