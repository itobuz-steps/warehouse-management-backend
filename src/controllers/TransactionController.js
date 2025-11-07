import Transaction from '../models/transactionModel.js';
import tokenValidator from '../utils/verifyToken.js';
import Quantity from '../models/quantityModel.js';
import mongoose from 'mongoose';

export default class TransactionController {
  getTransactions = async (req, res, next) => {
    try {
      const transactions = await Transaction.find().populate(
        'product performedBy sourceWarehouse destinationWarehouse'
      );

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  };

  createStockIn = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const access_token = req.headers.authorization.split(' ')[1];
      const { products, supplier, notes, destinationWarehouse } = req.body;

      const userId = await tokenValidator(access_token);

      const transactions = [];

      for (const item of products) {
        const { productId, quantity, limit } = item;

        let quantityRecord = await Quantity.findOne({
          warehouseId: destinationWarehouse,
          productId,
        });

        if (quantityRecord) {
          quantityRecord.quantity += quantity;
        } else {
          quantityRecord = new Quantity({
            warehouseId: destinationWarehouse,
            productId,
            quantity,
            limit,
          });
        }

        await quantityRecord.save({ session });

        const transaction = new Transaction({
          type: 'IN',
          product: productId,
          quantity,
          supplier,
          destinationWarehouse,
          notes,
          performedBy: userId._id,
        });

        const createdTransaction = await transaction.save({ session });
        transactions.push(createdTransaction);
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Stock-in transactions created successfully',
        transactions,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };

  createStockOut = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bearer_token = req.headers.authorization;
      const access_token = bearer_token.split(' ')[1];
      const {
        products,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        notes,
        sourceWarehouse,
      } = req.body;

      const userId = await tokenValidator(access_token);

      const transactions = [];

      for (const item of products) {
        const { productId, quantity } = item;

        const quantityRecord = await Quantity.findOne({
          warehouseId: sourceWarehouse,
          productId,
        });

        if (quantityRecord.quantity < quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Insufficient stock. Available: ${quantityRecord.quantity}, Requested: ${quantity}`,
          });
        }

        quantityRecord.quantity -= quantity;
        await quantityRecord.save({ session });

        const transaction = new Transaction({
          type: 'OUT',
          product: productId,
          quantity,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          sourceWarehouse,
          notes,
          performedBy: userId._id,
        });

        const createdTransaction = await transaction.save({ session });
        transactions.push(createdTransaction);
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Stock-out transactions created successfully',
        transactions,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
}
