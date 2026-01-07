import express from 'express';
import TransactionController from '../controllers/TransactionController.js';
import { validate } from '../validations/middlewares/validator.js';
import {
  adjustmentSchema,
  stockInSchema,
  stockOutSchema,
  transferSchema,
} from '../validations/schema/transactionSchema.js';

const transactionController = new TransactionController();

const router = express.Router();

router.get('/', transactionController.getTransactions);

router.get(
  '/warehouse-specific-transaction/:warehouseId',
  transactionController.getWarehouseSpecificTransactions
);

router.post(
  '/stock-in',
  validate(stockInSchema),
  transactionController.createStockIn
);
router.post(
  '/stock-out',
  validate(stockOutSchema),
  transactionController.createStockOut
);
router.post(
  '/adjustment',
  validate(adjustmentSchema),
  transactionController.createAdjustment
);
router.post(
  '/transfer',
  validate(transferSchema),
  transactionController.createTransfer
);

router.get('/generate-invoice/:id', transactionController.generateInvoice);

export default router;
