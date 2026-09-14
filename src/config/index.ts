/**
 * @description node modules
 */
import dotenv from 'dotenv';

/**
 * @description: types
 */
import ms from 'ms';

dotenv.config();

const config = {
  PORT: process.env.PORT || 5001,
  APP_NAME: process.env.APP_NAME || 'vin-check-api-v0',
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: [``],
  DB_URL: process.env.PSQL_DB_URL,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE as ms.StringValue,
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE as ms.StringValue,
  WHITELIST_ADMIN_MAILS: [],
  DEFAULT_RES_LIMIT: 20,
  DEFAULT_RES_OFFSET: 0,
};

export default config;
