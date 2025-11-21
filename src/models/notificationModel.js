import mongoose from 'mongoose';
import notificationTypes from '../constants/notificationTypes.js';

const notificationModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(notificationTypes),
      required: true,
    },
    title: String,
    message: String,
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    seen: { type: Boolean, default: false },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationModel);
