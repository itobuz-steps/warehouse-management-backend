import nodemailer from 'nodemailer';
import config from '../config/config.js';

export default class SendEmail {
  mailSender = async (email, title, body) => {
    try {
      console.log('sending email...');

      const transporter = nodemailer.createTransport({
        service: config.MAIL_SERVICE,
        auth: {
          user: config.MAIL_USER,
          pass: config.MAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: config.MAIL_USER,
        to: email,
        subject: title,
        html: body,
      });

      return info;
    } catch (error) {
      return error;
    }
  };

  sendInvitationEmail = async (email, link, next) => {
    try {
      const mailResponse = await this.mailSender(
        email,
        'Invitation Link',
        `<h1>Please click on the link to signup and set password</h1>
       <p>Here is your link: ${link}</p>
       <p>Link will valid only for 5 minutes.</p>`
      );

      console.log('Email sent successfully: ', mailResponse);
    } catch (error) {
      next(error);
    }
  };

  sendOtpHelper = async (email, otp, next) => {
    try {
      const mailResponse = await this.mailSender(
        email,
        'OTP Confirmation',
        `<div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4a90e2;">Please Confirm Your OTP</h2>
          <p>Your one-time password (OTP) is:</p>
          <p style="font-size: 18px; font-weight: bold; color: #000;">${otp}</p>
          <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
        </div>`
      );

      console.log('Email sent successfully: ', mailResponse);
    } catch (error) {
      next(error);
    }
  };
}
