/**
 * @description: node modules
 */
import winston, { transport } from 'winston';

/**
 * @description: custom modules
 */
import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

/**
 * @description: define transport array to hold defferent loggin transports
 */
const transports: winston.transport[] = [];

/**
 * @description: if the application is not running in production mode
 * add a console transport
 */
if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        align(),
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
  );
}

//@description: creating a loogger instance using winston
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info', // set default logger level
  format: combine(timestamp(), errors({ stack: true }), json()), // use JSON format to messages
  transports,
  silent: config.NODE_ENV === 'test', // disable in test env
});

export { logger };
