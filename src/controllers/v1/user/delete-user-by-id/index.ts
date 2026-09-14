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
 * @description: types
 */
import type { Request, Response } from 'express';

const DeleteUserByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found.',
      });

      logger.warn(`User ${userId} not found.`);

      return;
    }

    await prisma.user.delete({ where: { id: userId } });

    res.sendStatus(204);

    logger.info(`User ${userId} deleted successfully.`);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error.',
      error: err,
    });

    logger.error('Error while deleting user by id.', err);

    return;
  }
};

export default DeleteUserByIdController;
