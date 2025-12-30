import nodemailer from 'nodemailer';
import config from '../config/config.js';
import generatePdf from '../services/generatePdf.js';

export default class SendEmail {
  mailSender = async (email, title, body, attachment = null) => {
    try {
      console.log('sending email...');

      const transporter = nodemailer.createTransport({
        service: config.MAIL_SERVICE,
        auth: {
          user: config.MAIL_USER,
          pass: config.MAIL_PASS,
        },
      });

      const mailFields = {
        from: config.MAIL_USER,
        to: email,
        subject: title,
        html: body,
      };

      if (attachment) {
        mailFields.attachments = [
          {
            filename: 'invoice.pdf',
            content: attachment,
            contentType: 'application/pdf',
          },
        ];
      }

      const info = await transporter.sendMail(mailFields);

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

  sendLowStockEmail = async (email, user, product, warehouse) => {
    try {
      const mailResponse = await this.mailSender(
        email,
        'Low Stock Alert',
        `
        <h2>Low Stock Alert</h2>
        <p>Hello ${user.name || ''},</p>
        <p>The product <b>${product.name}</b> in <b>${warehouse.name}</b> is below the stock limit.</p>
        <p>Please restock it as soon as possible.</p>
      `
      );

      console.log('Low stock email sent:', mailResponse);
    } catch (err) {
      throw new Error(err);
    }
  };

  sendPendingShipmentEmail = async (email, user, product, warehouse) => {
    try {
      const mailResponse = await this.mailSender(
        email,
        'Pending Shipment Alert',
        `
        <h2>Pending Shipment Alert</h2>
        <p>Hello ${user.name || ''},</p>
        <p>A shipment for <b>${product.name}</b> in <b>${warehouse.name}</b> is still pending.</p>
      `
      );

      console.log('Pending shipment email sent:', mailResponse);
    } catch (err) {
      throw new Error(err);
    }
  };

  sendProductShippedEmailToCustomer = async (transaction) => {
    console.log('Transaction', transaction);
    try {
      const invoice = await generatePdf(transaction);

      const mailResponse = await this.mailSender(
        transaction.customerEmail,
        'Product Shipment Details',
        `
       <h2>Product Shipment Status Updated</h2>
       <p>Hello ${transaction.customerName || ''},</p>
       <p>Your shipment status for Order Id: <b>${transaction._id}</b> is successfully Delivered</p>
       <p>Your order status has changed to <b>${transaction.shipment}</b></p>
       <p>Please find all details of the Order in the attached PDF</p>
       <br>
       <br>
       <p>Thanks for the business</p>
     `,
        invoice
      );

      console.log('Pending shipment email sent:', mailResponse);
    } catch (error) {
      console.log(error);
    }
  };
}
