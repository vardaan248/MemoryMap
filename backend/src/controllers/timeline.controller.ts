import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// ── GET /timeline ─────────────────────────────────────
// All entries across all trips, newest first, with filters
export const getTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;
    const {
      year,
      mood,
      page = '1',
      limit = '20',
    } = req.query;

    const where: any = { trip: { userId } };

    if (year) {
      const y = parseInt(year as string);
      where.date = {
        gte: new Date(`${y}-01-01`),
        lte: new Date(`${y}-12-31`),
      };
    }

    if (mood) where.mood = mood;

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          photos: { orderBy: { order: 'asc' }, take: 3 },
          trip: { select: { id: true, title: true, coverImage: true } },
        },
      }),
      prisma.entry.count({ where }),
    ]);

    res.json({
      entries,
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

// ── GET /timeline/years ───────────────────────────────
// All years that have entries (for the year filter)
export const getYears = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;

    const entries = await prisma.entry.findMany({
      where: { trip: { userId } },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    const years = [...new Set(entries.map((e) => new Date(e.date).getFullYear()))].sort(
      (a, b) => b - a
    );

    res.json({ years });
  } catch (err) {
    next(err);
  }
};

// ── GET /timeline/stats ───────────────────────────────
// Rich statistics for the stats panel
export const getTimelineStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string }).id;

    const [user, trips, entries] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { totalTrips: true, totalCountries: true, totalPhotos: true },
      }),
      prisma.trip.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          countries: true,
          cities: true,
          totalDays: true,
          entryCount: true,
          photoCount: true,
          coverImage: true,
          startDate: true,
          endDate: true,
          status: true,
        },
        orderBy: { totalDays: 'desc' },
      }),
      prisma.entry.findMany({
        where: { trip: { userId } },
        select: { mood: true, country: true, city: true, date: true },
      }),
    ]);

    // Mood breakdown
    const moodCounts: Record<string, number> = {
      AMAZING: 0, HAPPY: 0, NEUTRAL: 0, TIRED: 0, CHALLENGED: 0,
    };
    entries.forEach((e) => { if (e.mood) moodCounts[e.mood]++; });

    // Countries with entry counts
    const countryCounts: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.country) countryCounts[e.country] = (countryCounts[e.country] ?? 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));

    // Entries by month (last 12 months)
    const now = new Date();
    const monthlyActivity: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const count = entries.filter((e) => {
        const ed = new Date(e.date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      }).length;
      monthlyActivity.push({ month: label, count });
    }

    // Best mood trip (most AMAZING entries)
    const allCities = new Set<string>();
    trips.forEach((t) => t.cities.forEach((c) => allCities.add(c)));

    const totalDays = trips.reduce((sum, t) => sum + t.totalDays, 0);
    const longestTrip = trips[0] ?? null;

    res.json({
      stats: {
        totalTrips: user?.totalTrips ?? 0,
        totalCountries: user?.totalCountries ?? 0,
        totalCities: allCities.size,
        totalPhotos: user?.totalPhotos ?? 0,
        totalDays,
        totalEntries: entries.length,
        moodCounts,
        topCountries,
        monthlyActivity,
        longestTrip,
      },
    });
  } catch (err) {
    next(err);
  }
};
