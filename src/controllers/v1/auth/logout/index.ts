/**
 * @description: custom modules
 */
import config from '@/config';
import { prisma } from '@/db';
import { logger } from '@/lib/winston';

/**
 * @description: type
 */
import type { Request, Response } from 'express';

const LogoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken as string;

    if (refreshToken) {
      await prisma.token.delete({ where: { token: refreshToken } });

      logger.info('User refresh token deleted successfully.', {
        userId: req.userId,
        token: refreshToken,
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.sendStatus(204);

    logger.info('User successfully logout.');
  } catch (err) {
    res.status(500).json({
      code: 'SereverError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during user logout', err);
  }
};

export default LogoutController;
