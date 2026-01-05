import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
import Product from '../models/productModel.js';
import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';
import sendNotification from '../services/notificationService.js';
import USER_TYPES from '../constants/userConstants.js';
import Transaction from '../models/transactionModel.js';

export default class Notification {
  notifyLowStock = async (productId, warehouseId, transactionPerformedBy) => {
    try {
      //extracting product and warehouse detail.
      const product = await Product.findById(productId);
      const warehouse = await Warehouse.findById(warehouseId);

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
      throw new Error(err);
    }
  };

  notifyPendingShipment = async (
    productId,
    warehouseId,
    transactionId,
    transactionPerformedBy
  ) => {
    try {
      const warehouse = await Warehouse.findById(warehouseId);
      const product = await Product.findById(productId);

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
        message: `A shipment for ${product.name} from ${warehouse.name} is pending.`,
        warehouse,
        product,
        transactionId,
        transactionPerformedBy,
      });
    } catch (err) {
      throw new Error(err);
    }
  };

  notifyTransaction = async (productId, warehouseId, transactionId, type, transactionPerformedBy) => {
    try {
      const warehouse = await Warehouse.findById(warehouseId);
      const product = await Product.findById(productId);
      const transaction = await Transaction.findById(transactionId);

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
        type: type,
        title: `Transaction ${transaction.type} Alert`,
        message: `Transaction of Type: ${transaction.type} for ${product.name} regarding ${warehouse.name} is done.`,
        warehouse,
        product,
        transactionId,
        transactionPerformedBy,
      });
    } catch (err) {
      throw new Error(err);
    }
  };
}
