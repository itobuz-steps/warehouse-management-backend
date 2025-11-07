import mongoose from 'mongoose';

const quantityModel = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
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
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Quantity = mongoose.model('Quantity', quantityModel);
export default Quantity;
