import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['LOW_STOCK', 'PENDING_SHIPMENT'],
      required: true,
    },
    title: String,
    message: String,
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
