/**
 * @description: node modules
 */

/**
 * @description: custom modules
 */
import config from '@/config';
import { logger } from '@/lib/winston';

/**
 * @description: prisma
 */
import { prisma } from '@/db';

/**
 * @description: types
 */
import type { Request, Response } from 'express';

const GetAllUsersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const limit =
      parseInt(req.query.limit as string) || config.DEFAULT_RES_LIMIT;
    const offset =
      parseInt(req.query.offset as string) || config.DEFAULT_RES_OFFSET;

    const total = await prisma.user.count();

    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
    });

    res.status(200).json({
      limit,
      offset,
      total,
      users,
    });

    logger.info('Getting all users with params.', { limit, offset });
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error.',
      error: err,
    });

    logger.error('Error while getting all users list.', err);

    return;
  }
};

export default GetAllUsersController;
