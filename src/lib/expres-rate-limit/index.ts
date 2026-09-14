/**
 * @description: node modules
 */
import { rateLimit } from 'express-rate-limit';

// @description: configure rate limit
const limiter = rateLimit({
  windowMs: 60000, // 1-minute time window for request limiting
  limit: 60, // allow max of 60 request per window and per IP
  standardHeaders: 'draft-8', // use the latest standart rate-limit headers
  legacyHeaders: false, // deprecated X-Ratelimit headers
  message: {
    error:
      'You have send to many requests in a given amount time. Please try again later.',
  },
});

export default limiter;
