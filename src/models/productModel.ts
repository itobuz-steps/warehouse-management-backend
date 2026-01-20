import mongoose, { Model, Schema } from 'mongoose';
import CATEGORY_TYPES from '../constants/categoryConstants.js';
import type { IProduct } from '../types/models.js';

const productModel = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(CATEGORY_TYPES),
    },
    description: {
      type: String,
    },
    productImage: {
      type: [String],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    markup: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      default: 10,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> = mongoose.model<IProduct>(
  'Product',
  productModel
);
export default Product;
