import express from "express";
import BrowserNotificationsController from "../controllers/BrowserNotificationController.js";

const router = express.Router();

const browserNotificationController = new BrowserNotificationsController();

router.post("/", browserNotificationController.subscribe);
router.get("/", browserNotificationController.trigger);

export default router;