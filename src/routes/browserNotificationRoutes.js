import express from 'express';
import BrowserNotificationsController from '../controllers/BrowserNotificationController.js';

const router = express.Router();

const browserNotificationController = new BrowserNotificationsController();

router.get('/:offset', browserNotificationController.getNotifications);
router.post('/subscribe', browserNotificationController.subscribe);
router.put('/mark-all-seen', browserNotificationController.markAllAsSeen);
router.patch(
  '/change-shipment-status/:id',
  browserNotificationController.shipShipmentStatus
);
router.patch(
  '/cancel-shipment/:id',
  browserNotificationController.cancelShipmentStatus
);

export default router;
