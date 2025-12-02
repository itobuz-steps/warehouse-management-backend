import Subscription from '../models/subscriptionModel.js';

export default class BrowserNotificationsController {
  subscribe = async (req, res, next) => {
    console.log("Inside subscribe");
    try {
      const  subscription  = req.body ?? {};

      if (!subscription?.endpoint) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription payload: missing endpoint',
          timestamp: new Date().toISOString(),
        });
      }

      const record = await Subscription.create(subscription);

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
}
