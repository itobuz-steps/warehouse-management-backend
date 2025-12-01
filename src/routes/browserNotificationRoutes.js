import express from "express";
import BrowserNotificationsController from "../controllers/BrowserNotificationController.js";

const router = express.Router();

const browserNotificationController = new BrowserNotificationsController();

router.post("/subscribe", browserNotificationController.subscribe);

export default router;