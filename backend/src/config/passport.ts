import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { config } from './index';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

// ── JWT Strategy ──────────────────────────────────────
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.accessSecret,
      algorithms: ['HS256'],
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub as string },
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        });

        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// ── Google OAuth Strategy ─────────────────────────────
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatarUrl = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email returned from Google'), undefined);
        }

        // Upsert user — find by googleId or email
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ googleId: profile.id }, { email }],
          },
        });

        if (user) {
          // Update existing user with latest Google profile data
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              name: user.name || profile.displayName,
              avatarUrl: user.avatarUrl || avatarUrl,
              isVerified: true,
            },
          });
        } else {
          // Create new user from Google profile
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              avatarUrl,
              googleId: profile.id,
              isVerified: true,
            },
          });
          logger.info(`New user registered via Google: ${email}`);
        }

        return done(null, user);
      } catch (err) {
        logger.error('Google OAuth error:', err);
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;
