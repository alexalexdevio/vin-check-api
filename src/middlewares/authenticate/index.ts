/**
 * @description: node modules
 */
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * @description: custom modules
 */
import { VerifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

/**
 * @description: types
 */
import type { Request, Response, NextFunction } from 'express';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provider.',
    });

    return;
  }

  const [_, token] = authHeader.split(' ');

  try {
    const jwtPayload = VerifyAccessToken(token) as { userId: string };

    req.userId = jwtPayload.userId;

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired, request a new one with refresh token.',
      });

      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token invalid.',
      });

      return;
    }

    res.status(500).json({
      code: 'ServertError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during authenticate.', err);
  }
};

export default authenticate;
