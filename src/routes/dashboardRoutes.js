import express from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();
const dashboardController = new DashboardController();

router.get('/get-top-products/:selectedWarehouse', dashboardController.getTopProducts);
router.get(
  '/get-inventory-category',
  dashboardController.getInventoryByCategory
);
router.get(
  '/get-product-transaction/',
  dashboardController.getProductTransaction
);

export default router;
