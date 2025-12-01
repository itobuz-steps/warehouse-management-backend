import express from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();
const dashboardController = new DashboardController();

router.get(
  '/get-top-products/:warehouseId',
  dashboardController.getTopProducts
);

router.get(
  '/get-top-products-chart-data/:warehouseId',
  dashboardController.generateTopFiveProductsExcel
);

router.get(
  '/get-inventory-category/:warehouseId',
  dashboardController.getInventoryByCategory
);
router.get(
  '/get-product-transaction/:warehouseId',
  dashboardController.getProductTransaction
);
router.get(
  '/get-transaction-stats/:warehouseId',
  dashboardController.getTransactionStats
);
router.get(
  '/get-low-stock-products/:warehouseId',
  dashboardController.getLowStockProducts
);

export default router;
