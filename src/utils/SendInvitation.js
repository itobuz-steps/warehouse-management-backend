import nodemailer from 'nodemailer';
import config from '../config/config.js';

export default class SendInvitation {
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
        from: 'System - warehouse management',
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
}
