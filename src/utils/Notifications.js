// import { sendNotificationToUsers } from '../services/notificationService.js';
// import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
// import Product from '../models/productModel.js';
// import Warehouse from '../models/warehouseModel.js';
// import User from '../models/userModel.js';
// import USER_TYPES from '../constants/userConstants.js';

// export default class Notifications {
//   notifyLowStock = async (productId, warehouseId) => {
//     const product = await Product.findById(productId);
//     const warehouse = await Warehouse.findById(warehouseId);

//     console.log('Looking for warehouse:', warehouseId);

//     // Check warehouse document
//     const warehouseDoc = await Warehouse.findById(warehouseId);
//     console.log('Warehouse details:', {
//       id: warehouseDoc?._id,
//       name: warehouseDoc?.name,
//       managerIds: warehouseDoc?.managerIds,
//       managerCount: warehouseDoc?.managerIds?.length,
//     });

//     // Find users: admins OR managers assigned to this warehouse (from warehouse.managerIds)
//     const users = await User.find({
//       $or: [
//         { role: USER_TYPES.ADMIN },
//         { _id: { $in: warehouseDoc?.managerIds || [] } },
//       ],
//     });

//     console.log(
//       'Low Stock Alert - Found users:',
//       users.length,
//       'for warehouse:',
//       warehouseId
//     );
//     console.log(
//       'Users to notify:',
//       users.map((u) => ({
//         id: u._id,
//         role: u.role,
//         email: u.email,
//       }))
//     );

//     if (users.length > 0) {
//       await sendNotificationToUsers({
//         users,
//         type: NOTIFICATION_TYPES.LOW_STOCK,
//         title: 'Low Stock Alert',
//         message: `${product.name} is running low in ${warehouse.name}`,
//         product,
//         warehouse,
//       });

      
//     }
//   };

//   notifyPendingShipment = async (productId, warehouseId, transactionId) => {
//     const product = await Product.findById(productId);
//     const warehouse = await Warehouse.findById(warehouseId);

//     console.log('Looking for warehouse:', warehouseId);

//     // Check warehouse document
//     const warehouseDoc = await Warehouse.findById(warehouseId);
//     console.log('Warehouse details:', {
//       id: warehouseDoc?._id,
//       name: warehouseDoc?.name,
//       managerIds: warehouseDoc?.managerIds,
//       managerCount: warehouseDoc?.managerIds?.length,
//     });

//     // Find users: admins OR managers assigned to this warehouse (from warehouse.managerIds)
//     const users = await User.find({
//       $or: [
//         { role: USER_TYPES.ADMIN },
//         { _id: { $in: warehouseDoc?.managerIds || [] } },
//       ],
//     });

//     console.log(
//       'Pending Shipment Alert - Found users:',
//       users.length,
//       'for warehouse:',
//       warehouseId
//     );
//     console.log(
//       'Users to notify:',
//       users.map((u) => ({
//         id: u._id,
//         role: u.role,
//         email: u.email,
//       }))
//     );

//     if (users.length > 0) {
//       await sendNotificationToUsers({
//         users,
//         type: NOTIFICATION_TYPES.PENDING_SHIPMENT,
//         title: 'Pending Shipment Alert',
//         message: `A shipment for ${product.name} from ${warehouse.name} is pending. TransactionId: ${transactionId}`,
//         product,
//         warehouse,
//         transactionId,
//       });
//     }
//   };
// }
