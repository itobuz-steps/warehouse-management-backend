import mongoose, { Model, Schema } from 'mongoose';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
import type { INotification } from '../types/models.js';

const notificationSchema = new Schema<INotification>(
  {
    userIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    transactionPerformedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

    relatedProduct: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },

    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
    },

    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },

    isShipped: {
      type: Boolean,
      default: false,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notifications',
  notificationSchema
);
export default Notification;
