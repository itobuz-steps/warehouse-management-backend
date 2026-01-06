import Subscription from '../models/subscriptionModel.js';
import Notification from '../models/notificationModel.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';
import Quantity from '../models/quantityModel.js';
import Product from '../models/productModel.js';
import Warehouse from '../models/warehouseModel.js';
import SendEmail from '../utils/SendEmail.js';

export default class NotificationController {
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
        userId: req.userId,
        endpoint: subscription.endpoint,
      });

      if (existing) {
        //updating if payload is different.
        Object.assign(existing, subscription);
        await existing.save();

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
      const userId = new mongoose.Types.ObjectId(req.userId);

      const notifications = await Notification.aggregate([
        {
          $match: {
            userIds: {
              $in: [userId],
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: Number(offset),
        },

        {
          $limit: Number(limit),
        },

        {
          $lookup: {
            from: 'users',
            localField: 'transactionPerformedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'reportedBy',
            foreignField: '_id',
            as: 'reportedByUser',
          },
        },
        {
          $unwind: {
            path: '$reportedByUser',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            performedByName: '$user.name',
            performedByImage: '$user.profileImage',
            reportedByName: '$reportedByUser.name',
          },
        },
        {
          $unset: ['user', 'reportedByUser'],
        },
      ]);

      console.log('this is the notification', notifications);

      // Unseen notification count.
      const unseenCount = await Notification.countDocuments({
        userIds: { $in: [userId] },
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
      await Notification.updateMany(
        { userIds: { $in: [new mongoose.Types.ObjectId(req.userId)] } },
        { $set: { seen: true } }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as seen',
      });
    } catch (error) {
      next(error);
    }
  };

  shipShipmentStatus = async (req, res, next) => {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        new mongoose.Types.ObjectId(`${req.params.id}`),
        {
          shipment: SHIPMENT_TYPES.SHIPPED,
        },
        { new: true }
      ).populate('product performedBy sourceWarehouse');

      const product = await Product.findById(transaction.product);
      const warehouse = await Warehouse.findById(transaction.sourceWarehouse);

      transaction.shipment = SHIPMENT_TYPES.SHIPPED;
      await transaction.save();

      await Notification.updateMany(
        { transactionId: transaction._id },
        {
          title: 'Pending Shipment Alert: Shipped',
          isShipped: true,
          reportedBy: req.userId,
          message: `Shipment done for ${product.name} from ${warehouse.name} of Quantity: ${transaction.quantity}.`,
        },
        { new: true }
      );

      await new SendEmail().sendProductShippedEmailToCustomer(transaction);

      res.status(201).json({
        success: true,
        message: 'Status Changed to Shipped Successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  cancelShipmentStatus = async (req, res, next) => {
    let session;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const transaction = await Transaction.findById(req.params.id)
        .session(session)
        .populate('product performedBy sourceWarehouse');

      const product = await Product.findById(transaction.product);
      const warehouse = await Warehouse.findById(transaction.sourceWarehouse);

      if (!transaction) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      // Restore stock quantity
      const quantityRecord = await Quantity.findOne({
        warehouseId: transaction.sourceWarehouse,
        productId: transaction.product,
      }).session(session);

      quantityRecord.quantity += transaction.quantity;
      await quantityRecord.save({ session });

      // Update transaction shipment status
      transaction.shipment = SHIPMENT_TYPES.CANCELLED;
      await transaction.save({ session });

      // Update browser notifications
      await Notification.updateMany(
        { transactionId: transaction._id },
        {
          title: 'Pending Shipment Alert: Cancelled',
          isCancelled: true,
          reportedBy: req.userId,
          message: `Shipment Cancelled for ${product.name} from ${warehouse.name} of Quantity: ${transaction.quantity}.`,
        },
        { session }
      );

      console.log('Transaction:', transaction);

      await new SendEmail().sendProductCancelEmailToCustomer(transaction);

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: 'Shipment cancelled and stock reverted successfully',
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };
}
