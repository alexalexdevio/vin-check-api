/**
 * @description: node modules
 */

/**
 * @description: custom modules
 */
import { logger } from '@/lib/winston';

/**
 * @description: prisma
 */
import { prisma } from '@/db';

/**
 * @description: type
 */
import type { Request, Response } from 'express';

const GetUserByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: { passwordHash: true },
    });

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found.',
      });

      logger.warn(`User ${userId} not found.`);

      return;
    }

    res.status(200).json({ user });

    logger.info(`User ${userId} fetched successfully.`, user);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error.',
      error: err,
    });

    logger.error('Error while getting user by id.', err);

    return;
  }
};

export default GetUserByIdController;
