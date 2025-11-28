import Subscription from '../models/subscriptionModel.js';
import sendBrowserNotification from '../services/browserNotificationService.js';

export default class BrowserNotificationsController {
  subscribe = async (req, res, next) => {
    try {
      const { subscription } = req.body ?? {};
      const userId = req.userId;

      if (!subscription?.endpoint) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription payload: missing endpoint',
          timestamp: new Date().toISOString(),
        });
      }

      const record = await Subscription.save({
        subscription,
        userId,
      });

      return res.status(201).json({
        success: true,
        message: 'Subscription saved in database.',
        timestamp: new Date().toISOString(),
        data: record,
      });
      
    } catch (error) {
      next(error);
    }
  };

  trigger = async (req, res, next) => {
    try {
      const userId = req.userId;

      const result = await sendBrowserNotification({
        userId,
        title: req.body?.title,
        body: req.body?.body,
      });

      return res.status(200).json({
        success: true,
        message: 'Notification sent!',
        timestamp: new Date().toISOString(),
        userId: userId ?? null,
        ...result,
      });

    } catch (error) {
      if (/No subscriptions/i.test(error.message)) {
        return res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      next(error);
    }
  };
}
