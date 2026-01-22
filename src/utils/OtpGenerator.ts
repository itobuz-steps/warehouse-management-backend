import { NextFunction } from 'express';
import OTP from '../models/otpModel.js';
import SendEmail from './SendEmail.js';

const mailer = new SendEmail();

export default class OtpGenerator {
  generateOtp = async (email: string, next: NextFunction) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let otpDoc = await OTP.findOne({ email });

    if (!otpDoc) {
      otpDoc = new OTP({ email, otp: [otp] });
    } else {
      otpDoc.otp.push(otp);
    }
    await otpDoc.save();

    mailer.sendOtpHelper(email, otp, next);
  };
}
