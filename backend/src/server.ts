import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

async function bootstrap() {
  // Test DB connection
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    logger.info(`🚀 MemoryMap API running on http://localhost:${config.port}${config.apiPrefix}`);
    logger.info(`📘 Environment: ${config.env}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed. Bye!');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
}

bootstrap();
