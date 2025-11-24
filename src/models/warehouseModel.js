import mongoose from 'mongoose';

const warehouseModel = new mongoose.Schema(
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
    managerIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
    },
    active: {
      type: Boolean,
      default: true,
    },
    capacity: {
      type: Number,
      default: 10000,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const Warehouse = mongoose.model('Warehouse', warehouseModel);
export default Warehouse;
