import express from 'express';
import AnalyticsController from '../controllers/AnalyticsController.js';

const router = express.Router();
const analyticsController = new AnalyticsController();

router.get(
  '/product-quantities',
  analyticsController.getTwoProductQuantitiesForWarehouse
);
router.get(
  '/product-comparison-history',
  analyticsController.getTwoProductComparisonHistoryForWarehouse
);

export default router;
