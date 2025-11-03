import express from 'express';
import TransactionController from '../controllers/TransactionController.js';

const transactionController = new TransactionController();

const router = express.Router();

router.get('/', transactionController.getTransactions);
router.post('/stock-in', transactionController.createStockIn);
router.post('/stock-out', transactionController.createStockOut);

export default router;
