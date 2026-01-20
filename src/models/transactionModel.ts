import mongoose, { Model, Schema } from 'mongoose';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';
import type { ITransaction } from '../types/models.js';

const transactionModel = new mongoose.Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    destinationWarehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  'Transaction',
  transactionModel
);
export default Transaction;
