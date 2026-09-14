/**
 * @description: node modules
 */
import jwt from 'jsonwebtoken';

/**
 * @description: custom modules
 */
import config from '@/config';

export const GenerateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRE,
    subject: 'refresh-token',
  });
};

export const GenerateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRE,
    subject: 'refresh-token',
  });
};

export const VerifyAccessToken = (token: string) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

export const VerifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
