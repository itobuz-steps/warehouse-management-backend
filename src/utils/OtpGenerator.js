import OTP from '../models/otpModel.js';
import SendEmail from './SendEmail.js';

const mailer = new SendEmail();

export default class OtpGenerator {
  generateOtp = async (email, next) => {
    try {
      const otp = Math.floor(100000 + Math.random(900000)).toString();
      console.log(otp, typeof otp);

      let otpDoc = await OTP.findOne({ email });

      if (!otpDoc) {
        otpDoc = new OTP({ email, otp: [] });
      }

      otpDoc.otp.push(otp);
      await otpDoc.save();

      mailer.sendOtp(email, otp);
    } catch (error) {
      next(error);
    }
  };
}
