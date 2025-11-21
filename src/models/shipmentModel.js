import mongoose from 'mongoose';
import SHIPMENT_TYPES from '../constants/shipmentTypes';

const shipmentModel = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SHIPMENT_TYPES),
      default: SHIPMENT_TYPES.PENDING,
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Shipment = mongoose.model('Shipment', shipmentModel);
export default Shipment;
