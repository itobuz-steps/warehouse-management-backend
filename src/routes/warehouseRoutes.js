import express from 'express';
import WarehouseController from '../controllers/WarehouseController.js';

const router = express.Router();
const warehouseController = new WarehouseController();

router.get('/get-warehouses/:userId', warehouseController.getWarehouses);

router.get(
  '/get-warehouses/:userId/:warehouseId',
  warehouseController.getWarehouseById
);

router.get(
  '/get-warehouse-capacity/:userId/:warehouseId',
  warehouseController.getWarehouseCapacity
);

export default router;
