/**
 * @description: node modules
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

/**
 * @description: types
 */
import type { CorsOptions } from 'cors';

/**
 * @description: custom modules
 */
import config from '@/config';
import limiter from '@/lib/expres-rate-limit';
import { logger } from '@/lib/winston';
import { prisma } from '@/db';

/**
 * @description: routes v1
 */
import v1Routes from '@/routes/v1';

/**
 * @description app initial
 */
const app = express();

//CORS options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      // Rejected req
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS.`),
        false,
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS.`);
    }
  },
};

//Apply CORS middleware
app.use(cors(corsOptions));

// Enable body parsing
app.use(express.json());

/**
 * @description: Enable URL-encode request body parsing with extended mode
 * `extended: true` allows rich Objects and Arrays querystring library
 */
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * @description: Enable response compression
 * to reduce payload size and improve prerfomens
 */
app.use(
  compression({
    threshold: 1024, // only compress response largest than 1kb
  }),
);

/**
 * @description: Use Helmet to enchance security by settings HTTP headers
 */
app.use(helmet());

/**
 * @description: Apply rate limiting middleware to prevent excessive
 * request and enchance security
 */
app.use(limiter);

(async () => {
  try {
    await prisma.$connect();
    logger.info('DB was successfully connected.');
    app.use('/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`App runing http://localhost:${config.PORT}.`);
    });
  } catch (err) {
    logger.error(`Failed to start server`, err);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

/**
 * @description: Handle server shutdown gracefully by disconneting from database
 */
const handleServerShutDown = async () => {
  try {
    await prisma.$disconnect();
    logger.info('SERVER SHUTDOWN.');
    process.exit(1);
  } catch (err) {
    logger.error('Error during SERVER SHUTDOWN.', err);
  }
};

/**
 * @description: Listening for termination signal like 'SIGTERM' and 'SIGINT'
 */
process.on('SIGTERM', handleServerShutDown);
process.on('SIGINT', handleServerShutDown);
