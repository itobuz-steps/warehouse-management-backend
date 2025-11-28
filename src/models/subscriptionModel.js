import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String
  }
}, { timestamps: true });

export default mongoose.model("Subscription", SubscriptionSchema);
