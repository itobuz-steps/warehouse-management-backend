import mongoose, { Model, Schema } from 'mongoose';
import type { IQuantity } from '../types/models.js';

const quantityModel = new Schema<IQuantity>(
  {
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    limit: {
      type: Number,
      required: true,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

const Quantity: Model<IQuantity> = mongoose.model<IQuantity>(
  'Quantity',
  quantityModel
);
export default Quantity;
