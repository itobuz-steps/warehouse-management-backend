import express from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();
const dashboardController = new DashboardController();

router.get(
  '/get-top-products/:warehouseId',
  dashboardController.getTopFiveProducts
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
  '/get-inventory-category-chart-data/:warehouseId',
  dashboardController.getInventoryByCategoryExcel
);

router.get(
  '/get-product-transaction/:warehouseId',
  dashboardController.getProductTransaction
);
router.get(
  '/get-product-transaction-chart-data/:warehouseId',
  dashboardController.getProductTransactionExcel
);

router.get(
  '/get-transaction-stats/:warehouseId',
  dashboardController.getTransactionStats
);
router.get(
  '/get-low-stock-products/:warehouseId',
  dashboardController.getLowStockProducts
);
router.get(
  '/get-top-selling-products/:warehouseId',
  dashboardController.getTopSellingProducts
);
router.get(
  '/get-cancelled-orders/:warehouseId',
  dashboardController.getMostCancelledProducts
);
router.get(
  '/get-most-adjusted-products/:warehouseId',
  dashboardController.getMostAdjustedProducts
);
router.get('/get-profit-loss', dashboardController.getProfitLoss);

export default router;
