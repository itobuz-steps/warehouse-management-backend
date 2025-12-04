import mongoose from 'mongoose';
import Notification from '../models/notificationModel.js';
import Transaction from '../models/transactionModel.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';

export default class NotificationsController {
  getUserNotifications = async (req, res, next) => {
    try {
      const notifications = await Notification.find({ userId: req.user.userId })
        .populate('relatedProduct warehouse transactionId')
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
      await Notification.updateMany(
        { userId: req.user.userId },
        { seen: true }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as seen',
      });
    } catch (error) {
      next(error);
    }
  };

  changeShipmentStatus = async (req, res, next) => {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        new mongoose.Types.ObjectId(`${req.params.id}`),
        {
          shipment: SHIPMENT_TYPES.SHIPPED,
        },
        { new: true }
      );

      console.log('Shipment status updated for transaction:', transaction?._id);

      if (transaction) {
        try {
          await Notification.updateMany(
            { transactionId: transaction._id },
            { seen: true }
          );
        } catch (notifyErr) {
          console.error(
            'Error marking related notifications as seen:',
            notifyErr
          );
        }
      }

      res.status(201).json({
        message: 'Status Changed to Shipped Successfully',
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };
}
