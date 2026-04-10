import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';
import { logger } from '../utils/logger';

// ── Register (email + password) ───────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, 'An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    const { accessToken, refreshToken } = await generateTokens(user.id, req);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'Account created successfully.',
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// ── Login (email + password) ──────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Invalid email or password.');

    const { accessToken, refreshToken } = await generateTokens(user.id, req);

    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// ── Google OAuth callback ─────────────────────────────
export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // req.user is set by Passport Google strategy
    const user = req.user as { id: string };
    const { accessToken, refreshToken } = await generateTokens(user.id, req);

    // Redirect to Angular app with tokens in query params
    // Angular will extract them, store in memory, and clear the URL
    const redirectUrl = new URL(config.client.authCallbackUrl);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    res.redirect(redirectUrl.toString());
  } catch (err) {
    next(err);
  }
};

// ── Refresh Access Token ──────────────────────────────
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(400, 'Refresh token is required.');

    const { userId, session } = await verifyRefreshToken(refreshToken);

    // Rotate refresh token (one-time use)
    const { accessToken, refreshToken: newRefreshToken } =
      await generateTokens(userId, req, session.id);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

// ── Logout ────────────────────────────────────────────
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Invalidate this specific session
      await prisma.session.deleteMany({ where: { refreshToken } });
    }

    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── Get Current User ──────────────────────────────────
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        isPublic: true,
        totalTrips: true,
        totalCountries: true,
        totalPhotos: true,
        createdAt: true,
      },
    });

    if (!user) throw new ApiError(404, 'User not found.');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
