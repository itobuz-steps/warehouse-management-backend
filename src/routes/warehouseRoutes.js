import express from 'express';
import WarehouseController from '../controllers/WarehouseController.js';

const router = express.Router();
const warehouseController = new WarehouseController();

router.get('/get-warehouses/:userId', warehouseController.getWarehouses);

export default router;
