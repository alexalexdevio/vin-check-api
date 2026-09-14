/**
 * @description: node modules
 */

/**
 * @description: custom modules
 */
import { logger } from '@/lib/winston';

/**
 * @description: middlewares
 */

/**
 * @description: prisma
 */
import { prisma } from '@/db';

/**
 * @description: types
 */
import type { Request, Response } from 'express';

const UpdateCurrentUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const { email, name, first_name, last_name, currency, verify } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        name,
        firstName: first_name,
        lastName: last_name,
        currency: currency?.toUpperCase(),
        verify,
      },
      omit: {
        passwordHash: true,
      },
    });

    res.status(200).json({ user });

    logger.info(`User ${userId} update successfully.`, user);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: err,
    });

    logger.error('Error while updating current user.', err);

    return;
  }
};

export default UpdateCurrentUserController;
