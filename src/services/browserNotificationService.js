import Subscription from '../models/subscriptionModel.js';
import BrowserNotification from '../models/browserNotificationModel.js';
import webpush from '../config/webpush.js';

const sendBrowserNotification = async ({ users, type, title, message }) => {
  try {
    if (!users || !users.length) {
      throw new Error('No user found!');
    }

    const payload = JSON.stringify({ title, body: message });
    const results = [];

    for (const user of users) {
      const userId = user._id;
      const subscriptions = await Subscription.find({ userId });

      if (!subscriptions || subscriptions.length === 0) {
        results.push({
          userId,
          success: false,
          message: 'User not subscribed',
        });
        continue;
      }

      // Save notification in DB.
      await BrowserNotification.create({
        userId,
        title,
        message,
      });

      //Send notification to all subscriptions of a particular user
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

            results.push({ userId: s.userId, success: false, error: err.message});
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
