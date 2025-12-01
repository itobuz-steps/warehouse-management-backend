import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    endpoint: String,
    expirationTime: {
      type: Date,
      default: null,
    },
    keys: {
      p256dh: String,
      auth: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', SubscriptionSchema);
