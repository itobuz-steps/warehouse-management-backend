import mongoose, { Schema, Model } from 'mongoose';
import USER_TYPES from '../constants/userConstants.js';
import type { IUser } from '../types/models.js';

const userModel = new Schema<IUser>(
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
      enum: Object.values(USER_TYPES),
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
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userModel);
export default User;
