import Notification from '../models/notificationModel.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import { io } from '../socket.js';
import SendEmail from '../utils/SendEmail.js';

const sendMail = new SendEmail();

export const sendNotificationToUsers = async ({
  users,
  type,
  title,
  message,
  product,
  warehouse,
}) => {
  // 1. Save in DB
  const data = users.map((u) => ({
    userId: u._id,
    type,
    title,
    message,
    relatedProduct: product?._id,
    warehouse: warehouse?._id,
  }));

  await Notification.insertMany(data);

  // 2. Real-time socket push
  users.forEach((u) => {
    io().to(u._id.toString()).emit('notification', {
      title,
      message,
      type,
    });
  });

  // 3. Email sending

  for (let user of users) {
    if (type === NOTIFICATION_TYPES.LOW_STOCK) {
      await sendMail.sendLowStockEmail(user.email, user, product, warehouse);
    } else {
      await sendMail.sendPendingShipmentEmail(
        user.email,
        user,
        product,
        warehouse
      );
    }
  }
};
