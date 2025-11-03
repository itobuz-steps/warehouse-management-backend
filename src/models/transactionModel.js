import mongoose from 'mongoose';

const transactionModel = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT'],
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
    customer: {
      type: String,
    },
    orderNumber: {
      type: String,
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
    },
    // For Adjustments
    reason: {
      type: String,
      enum: ['Damage', 'Loss', 'Found', 'Correction', 'Other'],
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
    // For undo functionality
    canUndo: {
      type: Boolean,
      default: true,
    },
    undoExpiry: {
      type: Date,
    },
    isUndone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

transactionModel.pre('save', function (next) {
  if (this.isNew) {
    this.undoExpiry = new Date(Date.now() + 10000);
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionModel);
export default Transaction;
