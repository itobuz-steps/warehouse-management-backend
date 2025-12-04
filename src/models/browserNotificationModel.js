import mongoose from 'mongoose';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';

const browserNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    profileImage: {
      type: String,
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    seen: {
      type: Boolean,
      default: false,
    },

    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },

    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  },

  { timestamps: true }
);

export default mongoose.model('BrowserNotification', browserNotificationSchema);
