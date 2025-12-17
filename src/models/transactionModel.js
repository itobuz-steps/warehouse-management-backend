import mongoose from 'mongoose';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';

const transactionModel = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    // For Stock IN
    supplier: {
      type: String,
    },
    // For Stock OUT
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    customerPhone: {
      type: Number,
    },
    customerAddress: {
      type: String,
    },
    shipment: {
      type: String,
      enum: Object.values(SHIPMENT_TYPES),
      // default: SHIPMENT_TYPES.PENDING,
    },
    // For Adjustments
    reason: {
      type: String,
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionModel);
export default Transaction;
