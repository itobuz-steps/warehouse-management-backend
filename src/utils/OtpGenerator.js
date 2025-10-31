import OTP from '../models/otpModel.js';
import SendInvitation from './SendEmail.js';

const mailer = new SendInvitation();

export default class OtpGenerator {
  sendOtp = async (email) => {
    const otp = Math.floor(100000 + Math.random(900000)).toString();
    console.log(otp, typeof otp);

    let otpDoc = await OTP.findOne({ email });

    if (!otpDoc) {
      otpDoc = new OTP({ email, otp: [] });
    }

    otpDoc.otp.push(otp);
    await otpDoc.save();

    mailer.sendOtp(email, otp);
  };
}
