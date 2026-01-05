import express from 'express';
import NotificationController from '../controllers/NotificationController.js';

const router = express.Router();

const notificationController = new NotificationController();

router.get('/:offset', notificationController.getNotifications);
router.post('/subscribe', notificationController.subscribe);
router.put('/mark-all-seen', notificationController.markAllAsSeen);
router.patch(
  '/change-shipment-status/:id',
  notificationController.shipShipmentStatus
);
router.patch(
  '/cancel-shipment/:id',
  notificationController.cancelShipmentStatus
);

export default router;
