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
import type { Request, Response } from 'express';

const GetCurrentUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: {
        passwordHash: true,
      },
    });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: err,
    });

    logger.error('Error while getting current user.', err);
  }
};

export default GetCurrentUserController;
