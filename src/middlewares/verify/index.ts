/**
 * @description: custom modules
 */
import { logger } from '@/lib/winston';

/**
 * @description: prisma
 */
import { prisma } from '@/db';

/**
 * @description: types
 */
import type { Request, Response, NextFunction } from 'express';

const verify = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          verify: true,
        },
      });

      if (!user) {
        res.status(404).json({
          code: 'NotFound',
          message: 'User not found',
        });

        return;
      }

      // TODO: crete verify auth check

      return next();
    } catch (err) {
      res.status(500).json({
        code: 'ServerError',
        message: 'Internal Server Error',
        error: err,
      });

      logger.error('Error while verify user.', err);
    }
  };
};

export default verify;
