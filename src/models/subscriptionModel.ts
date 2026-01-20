import mongoose, { Model, Schema } from 'mongoose';
import type { ISubscription } from '../types/models.js';

const SubscriptionSchema = new Schema<ISubscription>(
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Subscription: Model<ISubscription> = mongoose.model<ISubscription>(
  'Subscription',
  SubscriptionSchema
);
export default Subscription;
