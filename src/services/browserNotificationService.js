import Subscription from "../models/subscriptionModel.js";
import BrowserNotification from "../models/browserNotificationModel.js";
import webpush from "web-push";

const sendBrowserNotification = async ({ userId, title, body }) => {
  try {
    if (!userId) {
      throw new Error("Missing userId");
    }

    const subscription = await Subscription.find({ userId });

    if (subscription.length === 0) {
      throw new Error("User not subscribed!");
    }

    // Save notification in DB
    await BrowserNotification.create({
      userId,
      title,
      message: body,
    });

    const payload = JSON.stringify({ title, body });

    // Send push notifications to all devices
    await Promise.all(
      subscription.map((s) =>
        webpush.sendNotification(s.subscription, payload)
      )
    );

    // Return data (not an HTTP response)
    return {
      success: true,
      message: "Notification sent!",
      delivered: subscription.length,
    };

  } catch (err) {
    // Throw error so controller can catch it
    throw new Error(err.message);
  }
};

export default sendBrowserNotification;
