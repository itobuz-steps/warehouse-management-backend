import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
import Product from '../models/productModel.js';
import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';
import sendNotification from '../services/notificationService.js';
import USER_TYPES from '../constants/userConstants.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';

export default class Notification {
  notifyLowStock = async (
    productId: string | mongoose.Types.ObjectId,
    warehouseId: string | mongoose.Types.ObjectId,
    transactionPerformedBy: string
  ) => {
    try {
      //extracting product and warehouse detail.
      const product = await Product.findById(productId);
      const warehouse = await Warehouse.findById(warehouseId);

      if (!product || !warehouse) {
        throw new Error('Product or Warehouse not found');
      }

      //finding users linked with the warehouse.
      const users = await User.find({
        $or: [{ role: 'admin' }, { _id: { $in: warehouse?.managerIds || [] } }],
      });

      if (!users.length) {
        console.log('No user linked with the warehouse!');
        return;
      }

      const res = await sendNotification({
        users,
        type: NOTIFICATION_TYPES.LOW_STOCK,
        title: 'Low Stock Alert',
        message: `${product.name} is running low in ${warehouse.name}`,
        product,
        warehouse,
        transactionPerformedBy,
      });

      console.log(res);
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
    }
  };

  notifyPendingShipment = async (
    productId: mongoose.Types.ObjectId,
    warehouseId: mongoose.Types.ObjectId,
    transactionId: string,
    quantity: number,
    transactionPerformedBy: string
  ) => {
    try {
      const warehouse = await Warehouse.findById(warehouseId);
      const product = await Product.findById(productId);

      if (!product || !warehouse) {
        throw new Error('Product or Warehouse not found');
      }

      //find users related to warehouse.
      const users = await User.find({
        $or: [
          { role: USER_TYPES.ADMIN },
          { _id: { $in: warehouse?.managerIds || [] } },
        ],
      });

      if (!users.length) {
        console.log('No user linked with the warehouse!');
        return;
      }

      await sendNotification({
        users,
        type: NOTIFICATION_TYPES.PENDING_SHIPMENT,
        title: 'Pending Shipment Alert',
        message: `A shipment for ${product.name} of Quantity: ${quantity} from ${warehouse.name} is pending.`,
        warehouse,
        product,
        transactionId,
        transactionPerformedBy,
      });
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
    }
  };

  notifyTransaction = async (
    productId: mongoose.Types.ObjectId,
    warehouseId: mongoose.Types.ObjectId,
    transactionId: string,
    quantity: number,
    transactionType: string,
    transactionPerformedBy: string
  ) => {
    try {
      const warehouse = await Warehouse.findById(warehouseId);
      const product = await Product.findById(productId);
      const transaction = await Transaction.findById(transactionId);

      if (!product || !warehouse) {
        throw new Error('Product or Warehouse not found');
      }

      //find users related to warehouse.
      const users = await User.find({
        $or: [
          { role: USER_TYPES.ADMIN },
          { _id: { $in: warehouse?.managerIds || [] } },
        ],
      });

      if (!users.length) {
        console.log('No user linked with the warehouse!');
        return;
      }

      await sendNotification({
        users,
        type: transactionType,
        title: `Transaction ${transaction?.type} Alert`,
        message: `Transaction of Type: ${transaction?.type} for ${product.name} in ${warehouse.name} of Quantity: ${quantity} is done.`,
        warehouse,
        product,
        transactionId,
        transactionPerformedBy,
      });
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
    }
  };
}
