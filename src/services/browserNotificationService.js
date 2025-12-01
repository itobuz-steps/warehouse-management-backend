import Subscription from '../models/subscriptionModel.js';
import BrowserNotification from '../models/browserNotificationModel.js';
import webpush from '../config/webpush.js'

const sendBrowserNotification = async ({ users, type, title, message }) => {
  try {
    if (!users || !users.length) {
      throw new Error('No user found!');
    }

    const results = [];

    const payload = JSON.stringify({ title, body: message });

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

      // Save notification in DB for this user
      await BrowserNotification.save({
        userId,
        title,
        message,
      });

      // Send notification to all subscriptions for that user
      await Promise.all(
        subscriptions.map((s) =>
          webpush.sendNotification(s.subscription, payload)
        )
      );

      results.push({
        userId,
        success: true,
        delivered: subscriptions.length,
      });
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
