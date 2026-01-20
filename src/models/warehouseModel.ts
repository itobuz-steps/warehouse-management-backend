import mongoose, { Schema, Model } from 'mongoose';
import type { WarehouseDocument } from '../types/models.js';

const warehouseModel = new Schema<WarehouseDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    managerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    capacity: {
      type: Number,
      default: 10000,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Warehouse: Model<WarehouseDocument> = mongoose.model(
  'Warehouse',
  warehouseModel
);

export default Warehouse;
