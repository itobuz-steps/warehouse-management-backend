import mongoose from 'mongoose';

const userModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: [true, 'Provide a Password'],
      minlength: 8,
    },
    role: {
      type: String,
      required: true,
      enum: ['manager', 'admin'],
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
