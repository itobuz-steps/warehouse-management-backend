import express from 'express';
import BrowserNotificationsController from '../controllers/BrowserNotificationController.js';
import { roundToNearestHours } from 'date-fns';

const router = express.Router();

const browserNotificationController = new BrowserNotificationsController();

router.get('/:offset', browserNotificationController.getNotifications);
router.post('/subscribe', browserNotificationController.subscribe);
router.put('/mark-all-seen', browserNotificationController.markAllAsSeen);
router.put('/change-shipment', browserNotificationController.changeShipmentStatus);

export default router;
