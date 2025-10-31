import mongoose from 'mongoose';

const warehouseModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

const Warehouse = mongoose.model('Warehouse', warehouseModel);
export default Warehouse;
