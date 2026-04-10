import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3000'), 10),
  apiPrefix: optional('API_PREFIX', '/api/v1'),

  db: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  google: {
    clientId: required('GOOGLE_CLIENT_ID'),
    clientSecret: required('GOOGLE_CLIENT_SECRET'),
    callbackUrl: required('GOOGLE_CALLBACK_URL'),
  },

  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME'),
    apiKey: required('CLOUDINARY_API_KEY'),
    apiSecret: required('CLOUDINARY_API_SECRET'),
  },

  client: {
    url: optional('CLIENT_URL', 'http://localhost:4200'),
    authCallbackUrl: optional(
      'CLIENT_AUTH_CALLBACK_URL',
      'http://localhost:4200/auth/callback'
    ),
  },

  email: {
    from: optional('EMAIL_FROM', 'noreply@memorymap.app'),
    sendgridKey: process.env['SENDGRID_API_KEY'],
  },

  isDev: process.env['NODE_ENV'] !== 'production',
  isProd: process.env['NODE_ENV'] === 'production',
};
