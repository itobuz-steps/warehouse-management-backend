import mongoose from 'mongoose';
import { categoriesTypes } from '../config/constants.js';

const productModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(categoriesTypes),
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
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

const Product = mongoose.model('Product', productModel);
export default Product;
