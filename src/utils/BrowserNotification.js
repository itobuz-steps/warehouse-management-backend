import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
import Product from '../models/productModel.js';
import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';
import sendBrowserNotification from '../services/browserNotificationService.js';
import USER_TYPES from '../constants/userConstants.js';

export default class BrowserNotification {
  notifyLowStock = async (productId, warehouseId, ) => {
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

      const res = await sendBrowserNotification({
        users,
        type: NOTIFICATION_TYPES.LOW_STOCK,
        title: 'Low Stock Alert',
        message: `${product.name} is running low in ${warehouse.name}`,
        product,
        warehouse,
      });

      console.log(res);
      
    } catch (err) {
      throw new Error(err);
    }
  };

  notifyPendingShipment = async (productId, warehouseId, transactionId) => {
    try {
      const warehouse = await Warehouse.findById(warehouseId);
      const product = await Product.findById(productId);

      //find users related to warehouse.
      const users = await User.find({
        $or: [{ role: USER_TYPES.ADMIN }, { _id: { $in: warehouse?.managerIds || [] } }],
      });

      if (!users.length) {
        console.log('No user linked with the warehouse!');
        return;
      }

      await sendBrowserNotification({
        users,
        type: NOTIFICATION_TYPES.PENDING_SHIPMENT,
        title: 'Pending Shipment Alert',
        message: `A shipment for ${product.name} from ${warehouse.name} is pending. TransactionId: ${transactionId}`,
        warehouse,
        product,
        transactionId,
      });
      
    } catch (err) {
      throw new Error(err);
    }
  };
}
