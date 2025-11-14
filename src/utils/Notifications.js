import { sendNotificationToUsers } from '../services/notificationService.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import Product from '../models/productModel.js';
import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';

export default class Notifications {
  notifyLowStock = async (productId, warehouseId) => {
    const product = await Product.findById(productId);
    const warehouse = await Warehouse.findById(warehouseId);

    const users = await User.find({
      $or: [{ wareHouseIds: warehouseId }, { role: 'admin' }],
    });

    if (users.length > 0) {
      await sendNotificationToUsers({
        users,
        type: NOTIFICATION_TYPES.LOW_STOCK,
        title: 'Low Stock Alert',
        message: `${product.name} is running low in ${warehouse.name}`,
        product,
        warehouse,
      });
    }
  };

  notifyPendingShipment = async (productId, warehouseId) => {
    const product = await Product.findById(productId);
    const warehouse = await Warehouse.findById(warehouseId);

    const users = await User.find({
      $or: [{ wareHouseIds: warehouseId }, { role: 'admin' }],
    });

    if (users.length > 0) {
      await sendNotificationToUsers({
        users,
        type: NOTIFICATION_TYPES.PENDING_SHIPMENT,
        title: 'Pending Shipment Alert',
        message: `A shipment for ${product.name} from ${warehouse.name} is pending.`,
        product,
        warehouse,
      });
    }
  };
}
