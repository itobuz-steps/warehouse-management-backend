import express from 'express';
import TransactionController from '../controllers/TransactionController.js';
import { validate } from '../validations/middlewares/validator.js';
import {
  stockInSchema,
  stockOutSchema,
} from '../validations/schema/transactionSchema.js';

const transactionController = new TransactionController();

const router = express.Router();

router.get('/', transactionController.getTransactions);
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

export default router;
