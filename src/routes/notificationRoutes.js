import express from 'express';
import NotificationController from '../controllers/NotificationController.js';

const router = express.Router();
const notificationsController = new NotificationController();

router.get('/my-notifications', notificationsController.getUserNotifications);
router.patch('/:notificationId/seen', notificationsController.markAsSeen);
router.patch('/mark-all-seen', notificationsController.markAllAsSeen);

export default router;
