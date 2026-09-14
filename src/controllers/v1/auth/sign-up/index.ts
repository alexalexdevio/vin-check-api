/**
 * @description: node modules
 */
import bcrypt from 'bcrypt';

/*
 * @description: custom modules
 * */
import { GenerateAccessToken, GenerateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import config from '@/config';

/**
 * @description: prisma
 */
import { prisma } from '@/db';

/**
 * @description: types
 */
import type { Request, Response } from 'express';
import { UserData } from '@/controllers/v1/auth/sign-up/types';

const SignupController = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as UserData;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        verify: false,
      },
    });

    /**
     * @description: Generate Access Token and Refresh Token for new user
     */
    const accessToken = GenerateAccessToken(user.id);
    const refreshToken = GenerateRefreshToken(user.id);

    /**
     * @description: store refresh token id DB
     */
    await prisma.token.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });
    logger.info('Refresh token created for user.', {
      refreshToken,
      userId: user.id,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      user: {
        username: user.name,
        email: user.email,
        isVerify: user.verify,
      },
      accessToken,
    });

    logger.info('User successfully sign up.', user);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during user sign up.', err);
  }
};

export default SignupController;
