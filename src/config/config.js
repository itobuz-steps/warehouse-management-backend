import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,

  DB_URI: process.env.DB_URI,

  TOKEN_SECRET: process.env.TOKEN_SECRET,
  TOKEN_EXPIRE: process.env.TOKEN_EXPIRE,

  MAIL_SERVICE: process.env.MAIL_SERVICE,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,

  ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,

  REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
};

export default config;
