/**
 * @description: node modules
 */
import { Router } from 'express';
import { body, cookie } from 'express-validator';
import bcrypt from 'bcrypt';

/**
 * @description: controllers
 */
import SignupController from '@/controllers/v1/auth/sign-up';
import SigninController from '@/controllers/v1/auth/sign-in';
import RefreshTokenController from '@/controllers/v1/auth/refresh-token';
import LogoutController from '@/controllers/v1/auth/logout';

/**
 * @description: middlewares
 */
import ValidationError from '@/middlewares/validation-error';
import authenticate from '@/middlewares/authenticate';

/**
 * @description: prisma
 */
import { prisma } from '@/db';

const router = Router();

router.post(
  '/sign-up',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters.')
    .isEmail()
    .withMessage('Invalid Email address')
    .custom(async (value) => {
      const userExist = await prisma.user.findUnique({
        where: { email: value },
      });

      if (userExist) throw new Error('User already exists.');
    }),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ max: 50 })
    .withMessage('Username must be less than 50 characters.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  ValidationError,
  SignupController,
);

router.post(
  '/sign-in',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters.')
    .isEmail()
    .withMessage('Invalid Email address')
    .custom(async (value) => {
      const userExist = await prisma.user.findUnique({
        where: { email: value },
      });

      if (!userExist) throw new Error('User already exists.');
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await prisma.user.findUnique({
        where: { email },
        select: { passwordHash: true },
      });

      if (!user) throw new Error('User email or password is invalid.');

      const passwordMatching = await bcrypt.compare(value, user.passwordHash);

      if (!passwordMatching)
        throw new Error('User email or password is invalid.');
    }),
  ValidationError,
  SigninController,
);

router.post(
  '/refresh-token',
  cookie('refreshToken')
    .notEmpty()
    .withMessage('refresh token is required.')
    .isJWT()
    .withMessage('Invalid refresh token'),
  ValidationError,
  RefreshTokenController,
);

router.post('/logout', authenticate, LogoutController);

export default router;
