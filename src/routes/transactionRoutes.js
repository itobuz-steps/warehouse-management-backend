import express from 'express';
import TransactionController from '../controllers/TransactionController.js';

const transactionController = new TransactionController();

const router = express.Router();

router.post('/stock-in', transactionController.createStockIn);

export default router;
