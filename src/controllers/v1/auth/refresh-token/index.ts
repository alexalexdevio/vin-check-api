/**
 * @description: node modules
 */
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * @description: custom modules
 */
import { prisma } from '@/db';
import { GenerateAccessToken, VerifyRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

/**
 * @description: types
 */
import type { Request, Response } from 'express';

const RefreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;

  try {
    const tokenExists = await prisma.token.findUnique({
      where: { token: refreshToken },
      select: { userId: true },
    });

    if (!tokenExists) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });

      return;
    }

    // @descriptyion: verify refresh token
    const jwtPaylaod = VerifyRefreshToken(refreshToken) as { userId: string };

    const accessToken = GenerateAccessToken(jwtPaylaod.userId);

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token expired, please login back again.',
      });

      return;
    }
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });

      return;
    }
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during refresh token.', err);
  }
};
export default RefreshTokenController;
