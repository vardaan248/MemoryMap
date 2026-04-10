import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { config } from '../config';
import { prisma } from './prisma';
import { ApiError } from './ApiError';

interface TokenPayload {
  sub: string;
  jti: string;
  type: 'access' | 'refresh';
}

// ── Generate both tokens and persist session ──────────
export const generateTokens = async (
  userId: string,
  req: Request,
  existingSessionId?: string
) => {
  const jti = uuidv4();

  const accessToken = jwt.sign(
    { sub: userId, jti, type: 'access' } as TokenPayload,
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
      algorithm: 'HS256',
    } as SignOptions
  );

  const refreshToken = jwt.sign(
    { sub: userId, jti, type: 'refresh' } as TokenPayload,
    config.jwt.refreshSecret as string,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      algorithm: 'HS256',
    } as SignOptions
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  if (existingSessionId) {
    // Rotate: replace old session
    await prisma.session.update({
      where: { id: existingSessionId },
      data: { refreshToken, expiresAt },
    });
  } else {
    // New session
    await prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip ?? null,
      },
    });
  }

  return { accessToken, refreshToken };
};

// ── Verify refresh token + look up session ────────────
export const verifyRefreshToken = async (token: string) => {
  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'Invalid token type.');
  }

  const session = await prisma.session.findUnique({
    where: { refreshToken: token },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  return { userId: payload.sub, session };
};
