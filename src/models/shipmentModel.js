import mongoose from 'mongoose';
import shipmentTypes from '../constants/shipmentTypes';

const shipmentModel = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(shipmentTypes),
      default: shipmentTypes.PENDING,
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
