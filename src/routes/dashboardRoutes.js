import express from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();
const dashboardController = new DashboardController();

router.get('/get-top-products', dashboardController.getTopProducts);

export default router;
