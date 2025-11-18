import Notification from '../models/notificationModel.js';

export default class NotificationsController {
  getUserNotifications = async (req, res, next) => {
    try {
      const notifications = await Notification.find({ userId: req.userId })
        .populate('relatedProduct warehouse')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsSeen = async (req, res, next) => {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: req.userId },
        { seen: true },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Notification marked as seen',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsSeen = async (req, res, next) => {
    try {
      await Notification.updateMany({ userId: req.userId }, { seen: true });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as seen',
      });
    } catch (error) {
      next(error);
    }
  };
}
