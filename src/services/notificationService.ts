import Subscription from '../models/subscriptionModel.js';
import Notification from '../models/notificationModel.js';
import webpush from '../config/webpush.js';
import SendEmail from '../utils/SendEmail.js';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
import { IProduct, IUser, WarehouseDocument } from '../types/models.js';

type SendNotificationParams = {
  users: IUser[];
  type: string;
  title: string;
  message: string;
  product?: IProduct;
  warehouse?: WarehouseDocument;
  transactionId?: string;
  transactionPerformedBy?: string;
};

const sendMail = new SendEmail();

//webpush and email has been sent here.
const sendNotification = async ({
  users,
  type,
  title,
  message,
  product,
  warehouse,
  transactionId,
  transactionPerformedBy,
}: SendNotificationParams) => {
  try {
    if (!users || !users.length) {
      throw new Error('No user found!');
    }

    const payload = JSON.stringify({ title, body: message });
    const results = [];
    const userIds = users.map((user) => user._id);

    let notificationData;

    if (transactionId) {
      notificationData = {
        type,
        title,
        message,
        product,
        warehouse,
        transactionId,
        transactionPerformedBy,
        userIds,
      };
    } else {
      notificationData = {
        type,
        title,
        message,
        product,
        warehouse,
        transactionPerformedBy,
        userIds,
      };
    }

    const data = await Notification.create(notificationData);

    if (!data) {
      throw new Error('Unable to create notification');
    }

    for (const user of users) {
      const userId = user._id;

      const subscriptions = await Subscription.find({ userId }).sort({
        updatedAt: -1,
      });

      if (!subscriptions || subscriptions.length === 0) {
        results.push({
          userId,
          success: false,
          message: 'User not subscribed',
        });
        continue;
      }

      //Sending email.
      console.log('sending email');

      if (!product || !warehouse) {
        throw new Error(
          'Product or Warehouse details not found for sending email'
        );
      }

      if (type === NOTIFICATION_TYPES.LOW_STOCK) {
        await sendMail.sendLowStockEmail(user.email, user, product, warehouse);
      } else {
        await sendMail.sendPendingShipmentEmail(
          user.email,
          user,
          product,
          warehouse
        );
      }

      //Send notification to all subscriptions of a particular user
      console.log('sending web-push notification');
      await Promise.all(
        subscriptions.map(async (s) => {
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: s.keys },
              payload
            );

            results.push({ userId: s.userId, success: true });
          } catch (err) {
            const error = err as Error & { statusCode: number };
            if (error.statusCode === 410) {
              await Subscription.deleteOne({ _id: s._id });
            }

            results.push({
              userId: s.userId,
              success: false,
              error: error.message,
            });
          }
        })
      );
    }

    return {
      success: true,
      message: 'Notifications processed',
      results,
    };
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
      throw new Error(err.message);
    }
  }
};

export default sendNotification;
