import Subscription from '../models/subscriptionModel.js';
import BrowserNotification from '../models/browserNotificationModel.js';
import webpush from '../config/webpush.js';
import SendEmail from '../utils/SendEmail.js';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';

const sendMail = new SendEmail();

//webpush and email has been sent here.
const sendBrowserNotification = async ({
  users,
  type,
  title,
  message,
  product,
  warehouse,
  transactionId,
}) => {
  try {
    if (!users || !users.length) {
      throw new Error('No user found!');
    }

    const payload = JSON.stringify({ title, body: message });
    const results = [];

    for (const user of users) {
      const userId = user._id;
      // const subscriptions = await Subscription.find({ userId });
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

      let data;

      // Save notification in DB.
      if (!transactionId) {
        data = await BrowserNotification.create({
          userId,
          type,
          title,
          message,
          product,
          warehouse,
        });
      } else {
        data = await BrowserNotification.create({
          userId,
          type,
          title,
          message,
          product,
          warehouse,
          transactionId,
        });
      }

      console.log('This is the saved data', data);

      //Sending email.
      console.log('sending email');
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
            if (err.statusCode === 410) {
              await Subscription.deleteOne({ _id: s._id });
            }

            results.push({
              userId: s.userId,
              success: false,
              error: err.message,
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
    throw new Error(err.message);
  }
};

export default sendBrowserNotification;
