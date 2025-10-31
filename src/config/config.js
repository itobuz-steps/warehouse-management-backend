import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  MAIL_SERVICE: process.env.MAIL_SERVICE,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  TOKEN_EXPIRE: process.env.TOKEN_EXPIRE,
};

export default config;
