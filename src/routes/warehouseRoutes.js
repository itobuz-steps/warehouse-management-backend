import express from 'express';
import WarehouseController from '../controllers/WarehouseController.js';

const router = express.Router();
const warehouseController = new WarehouseController();

router.get('/get-warehouses/', warehouseController.getWarehouses);

router.get(
  '/get-warehouses/:warehouseId',
  warehouseController.getWarehouseById
);

router.get(
  '/get-warehouse-capacity/:warehouseId',
  warehouseController.getWarehouseCapacity
);

export default router;
