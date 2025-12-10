import express from 'express';
import BrowserNotificationsController from '../controllers/BrowserNotificationController.js';

const router = express.Router();

const browserNotificationController = new BrowserNotificationsController();

router.get('/:offset', browserNotificationController.getNotifications);
router.get('/get-single-notification', browserNotificationController.getSingleNotification);
router.post('/subscribe', browserNotificationController.subscribe);
router.put('/mark-all-seen', browserNotificationController.markAllAsSeen);
router.patch('/change-shipment-status/:id', browserNotificationController.changeShipmentStatus);


export default router;
