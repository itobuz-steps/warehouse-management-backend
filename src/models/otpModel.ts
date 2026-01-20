import mongoose, { Model, Schema } from 'mongoose';
import type { IOtp } from '../types/models.js';

const otpModel = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OTP: Model<IOtp> = mongoose.model<IOtp>('OTP', otpModel);
export default OTP;
