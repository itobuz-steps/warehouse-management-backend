import express from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();
const dashboardController = new DashboardController();

router.get('/get-top-products', dashboardController.getTopProducts);
router.get('/get-inventory-category', dashboardController.getInventoryByCategory);

export default router;
