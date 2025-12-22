import mongoose from 'mongoose';
import CATEGORY_TYPES from '../constants/categoryConstants.js';

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
