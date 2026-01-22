import mongoose from 'mongoose';
import config from './config.js';
import { string } from 'yup';

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.DB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      process.exit(1);
    }
  }
};

export default connectDatabase;
