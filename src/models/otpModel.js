import mongoose from 'mongoose';

const otpModel = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model('OTP', otpModel);
export default OTP;
