import Notification from '../models/notificationModel.js';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
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
  transactionId,
}) => {
  // 1. Save in DB
  const data = users.map((u) => ({
    userId: u._id,
    type,
    title,
    message,
    relatedProduct: product?._id,
    warehouse: warehouse?._id,
    transactionId: transactionId,
  }));

  const savedNotifications = await Notification.insertMany(data);
  console.log('Notifications saved to DB:', savedNotifications.length);

  // 2. Real-time socket push
  users.forEach((u) => {
    console.log('Emitting socket notification to user:', u._id.toString());
    io().to(u._id.toString()).emit('notification', {
      title,
      message,
      type,
    });
  });

  // 3. Email sending
  console.log('Starting email sending...');
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
