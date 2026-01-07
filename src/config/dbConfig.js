import mongoose from 'mongoose';
import config from './config.js';

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.DB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDatabase;
