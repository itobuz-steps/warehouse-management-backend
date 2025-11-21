import mongoose from 'mongoose';
import userTypes from '../constants/userTypes.js';

const userModel = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(userTypes),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    wareHouseIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Warehouse',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userModel);
export default User;
