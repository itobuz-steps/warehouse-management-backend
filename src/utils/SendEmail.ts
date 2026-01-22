import nodemailer from 'nodemailer';
import config from '../config/config.js';
import generatePdf from '../services/generatePdf.js';
import Mail from 'nodemailer/lib/mailer/index.js';
import { NextFunction } from 'express';
import {
  IProduct,
  ITransaction,
  IUser,
  WarehouseDocument,
} from '../types/models.js';
import { Document } from 'mongoose';

export default class SendEmail {
  mailSender = async (
    email: string,
    title: string,
    body: string,
    attachment: Buffer | null = null
  ) => {
    try {
      console.log('sending email...');

      const transporter = nodemailer.createTransport({
        service: config.MAIL_SERVICE,
        auth: {
          user: config.MAIL_USER,
          pass: config.MAIL_PASS,
        },
      });

      const mailFields: Mail.Options = {
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

  sendInvitationEmail = async (
    email: string,
    link: string,
    next: NextFunction
  ) => {
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

  sendOtpHelper = async (email: string, otp: string, next: NextFunction) => {
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

  sendLowStockEmail = async (
    email: string,
    user: IUser,
    product: IProduct,
    warehouse: WarehouseDocument
  ) => {
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
      if (err instanceof Error) {
        throw err;
      }
    }
  };

  sendPendingShipmentEmail = async (
    email: string,
    user: IUser,
    product: IProduct,
    warehouse: WarehouseDocument
  ) => {
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
      if (err instanceof Error) {
        throw err;
      }
    }
  };

  sendProductShippedEmailToCustomer = async (
    transaction: ITransaction & Document
  ) => {
    try {
      const invoice = (await generatePdf(transaction)) as Buffer;

      // Buffer<ArrayBufferLike>;
      // Uint8Array<ArrayBufferLike>;

      const mailResponse = await this.mailSender(
        transaction.customerEmail as string,
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
      return error;
    }
  };

  sendProductCancelEmailToCustomer = async (
    transaction: ITransaction & Document
  ) => {
    try {
      const invoice = (await generatePdf(transaction)) as Buffer;

      const mailResponse = await this.mailSender(
        transaction.customerEmail as string,
        'Product Shipment Details',
        `
       <h2>Product Shipment Status Updated</h2>
       <p>Hello ${transaction.customerName || ''},</p>
       <p>Your shipment status for Order Id: <b>${transaction._id}</b> is Cancelled</p>
       <p>Your order status has changed to <b>${transaction.shipment}</b></p>
       <p>Please find all details of the Order in the attached PDF</p>
       <br>
       <br>
       <p>For more Information. Contact Here ${(transaction.performedBy as IUser).email}</p>
     `,
        invoice
      );

      console.log('Pending shipment email sent:', mailResponse);
    } catch (error) {
      console.log(error);
    }
  };
}
