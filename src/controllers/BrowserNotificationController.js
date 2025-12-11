import Subscription from '../models/subscriptionModel.js';
import BrowserNotification from '../models/browserNotificationModel.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';

export default class BrowserNotificationsController {
  subscribe = async (req, res, next) => {
    try {
      const subscription = req.body ?? {};
      subscription.userId = req.userId;

      if (!subscription?.endpoint) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription payload: missing endpoint',
          timestamp: new Date().toISOString(),
        });
      }

      let existing = await Subscription.findOne({
        where: { userId: req.userId, endpoint: subscription.endpoint },
      });

      if (existing) {
        //updating if payload is different.
        await existing.update(subscription);

        return res.status(200).json({
          success: true,
          message: 'Subscription already exists – updated.',
          timestamp: new Date().toISOString(),
          data: existing,
        });
      }

      //add a new entry in the database.
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

  getNotifications = async (req, res, next) => {
    try {
      const offset = parseInt(req.params.offset, 10) || 0;
      const limit = 10;

      //getting top 10 recent notifications.
      const notifications = await BrowserNotification.find({
        userId: req.userId,
      })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('warehouse');

      // Unseen notification count.
      const unseenCount = await BrowserNotification.countDocuments({
        userId: req.userId,
        seen: false,
      });

      res.status(200).json({
        success: true,
        data: notifications,
        unseenCount,
      });

    } catch (error) {
      next(error);
    }
  };

  markAllAsSeen = async (req, res, next) => {
    try {
      await BrowserNotification.updateMany(
        { userId: req.userId },
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
      const transactionId = new mongoose.Types.ObjectId(req.params.id);

      await Transaction.findByIdAndUpdate(
        `${transactionId}`,
        {
          shipment: SHIPMENT_TYPES.SHIPPED,
        },
        { new: true }
      );

      await BrowserNotification.updateMany(
        { transactionId: transactionId },
        { isShipped: true, shippedBy: req.userId },
        { new: true }
      );

      res.status(201).json({
        success: true,
        message: 'Status Changed to Shipped Successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // getSingleNotification = async (req, res, next) => {
  //   try {
  //     //getting most recent notification.
  //     const notification = await BrowserNotification.find({
  //       userId: req.userId,
  //     })
  //       .sort({ createdAt: -1 })
  //       .limit(1);

  //     res.status(200).json({
  //       success: true,
  //       message: 'Data fetched successfully',
  //       data: notification,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
