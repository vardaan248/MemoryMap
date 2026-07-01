import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tripRoutes from './routes/trip.routes';
import entryRoutes from './routes/entry.routes';
import photoRoutes from './routes/photo.routes';
import geoRoutes from './routes/geo.routes';
import timelineRoutes from './routes/timeline.routes';
import shareRoutes from './routes/share.routes';

// Passport strategies
import './config/passport';

const app: Application = express();

// ── Security ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.client.url,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Auth-specific stricter rate limit (applied per route)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// ── Request Parsing ───────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ── Logging ───────────────────────────────────────────
app.use(morgan(config.isDev ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Passport ──────────────────────────────────────────
app.use(passport.initialize());

// ── Health Check ──────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/trips', tripRoutes);
apiRouter.use('/trips/:tripId/entries', entryRoutes);
apiRouter.use('/entries/:entryId/photos', photoRoutes);
apiRouter.use('/geo', geoRoutes);
apiRouter.use('/timeline', timelineRoutes);
apiRouter.use('/share', shareRoutes);

app.use(config.apiPrefix, apiRouter);

// ── Error Handling ────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
