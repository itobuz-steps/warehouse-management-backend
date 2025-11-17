import express from 'express';
import AdminController from '../controllers/AdminController.js';
import isAdmin from '../validations/middlewares/checkAdmin.js';
import { validate } from '../validations/middlewares/validator.js';
import { warehouseSchema } from '../validations/schema/warehouseSchema.js';

const router = express.Router();
const adminController = new AdminController();

router.post(
  '/add-warehouse',
  isAdmin,
  validate(warehouseSchema),
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

router.get('/get-managers', isAdmin, adminController.getManagers);

export default router;
