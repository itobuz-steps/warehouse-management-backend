import mongoose from 'mongoose';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    profileImage: {
      type: String,
      required: true
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

    isShipped: {
      type: Boolean,
      default: false,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },
    
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('BNotification', notificationSchema);
