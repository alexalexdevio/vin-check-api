/**
 * @description: custom modules
 */
import config from '@/config';
import { GenerateAccessToken, GenerateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import { prisma } from '@/db';
/**
 * @description: types
 */
import type { Request, Response } from 'express';
import type { UserData } from './types';

const SigninController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as UserData;

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      res.status(400).json({
        code: 'NotFound',
        message: 'User not found',
      });

      return;
    }

    // @description: Generate access token and refresh for user
    const accessToken = GenerateAccessToken(user.id);
    const refreshToken = GenerateRefreshToken(user.id);

    await prisma.token.create({
      data: { token: refreshToken, userId: user.id },
    });
    logger.info('Refresh token created for user', {
      userId: user.id,
      refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
      },
      accessToken,
    });

    logger.info('User was signin successfully', user);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during user sign in.', err);
  }
};

export default SigninController;
