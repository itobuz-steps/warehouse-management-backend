import express from 'express';
import AdminController from '../controllers/AdminController.js';
import isAdmin from '../validations/middlewares/checkAdmin.js';
import WarehouseValidator from '../validations/middlewares/WarehouseValidator.js';

const router = express.Router();
const adminController = new AdminController();
const warehouseValidator = new WarehouseValidator();

router.post(
  '/add-warehouse',
  isAdmin,
  warehouseValidator.warehouseValidation,
  adminController.addWarehouse
); // send name , location, description(optional), managerIds[]

router.post(
  '/update-warehouse/:warehouseId',
  isAdmin,
  adminController.updateWarehouse
);

router.post(
  '/remove-warehouse/:warehouseId',
  isAdmin,
  adminController.removeWarehouse
);

router.post(
  '/restore-warehouse/:warehouseId',
  isAdmin,
  adminController.restoreWarehouse
);

router.get('/get-managers', isAdmin, adminController.getManagers);

router.get('/get-warehouses', isAdmin, adminController.getWarehouses);

export default router;
