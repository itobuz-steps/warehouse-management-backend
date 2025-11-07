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
      const userId = await tokenValidator(access_token);

      const { products, supplier, notes, destinationWarehouse } = req.body;

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
      const access_token = req.headers.authorization.split(' ')[1];
      const userId = await tokenValidator(access_token);

      const {
        products,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        orderNumber,
        notes,
        sourceWarehouse,
      } = req.body;

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
          orderNumber,
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

  createTransfer = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const access_token = req.headers.authorization?.split(' ')[1];
      const userId = await tokenValidator(access_token);

      const { products, notes, sourceWarehouse, destinationWarehouse } =
        req.body;

      if (sourceWarehouse === destinationWarehouse) {
        return res.status(400).json({
          message: 'Source and destination warehouses cannot be the same',
        });
      }

      const transactions = [];
      const updatedQuantities = [];

      for (const { productId, quantity } of products) {
        const sourceQuantity = await Quantity.findOne({
          warehouseId: sourceWarehouse,
          productId,
        });

        if (!sourceQuantity) {
          await session.abortTransaction();
          return res.status(404).json({
            message: `Product ${productId} not found in source warehouse`,
          });
        }

        if (sourceQuantity.quantity < quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Insufficient stock for product ${productId}. Available: ${sourceQuantity.quantity}, Requested: ${quantity}`,
          });
        }

        sourceQuantity.quantity -= quantity;
        await sourceQuantity.save({ session });

        let destQuantity = await Quantity.findOne({
          warehouseId: destinationWarehouse,
          productId,
        });

        if (!destQuantity) {
          destQuantity = new Quantity({
            warehouseId: destinationWarehouse,
            productId,
            quantity: 0,
            limit: 0,
          });
        }

        destQuantity.quantity += quantity;
        await destQuantity.save({ session });

        updatedQuantities.push({
          productId,
          sourceQuantity,
          destQuantity,
        });

        const outTransaction = new Transaction({
          type: 'OUT',
          product: productId,
          quantity,
          notes,
          sourceWarehouse,
          destinationWarehouse,
          performedBy: userId._id,
        });

        const inTransaction = new Transaction({
          type: 'IN',
          product: productId,
          quantity,
          notes,
          sourceWarehouse,
          destinationWarehouse,
          performedBy: userId._id,
        });

        const [createdOut, createdIn] = await Promise.all([
          outTransaction.save({ session }),
          inTransaction.save({ session }),
        ]);

        transactions.push(createdOut, createdIn);
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Stock transfer completed successfully',
        transactions,
        updatedQuantities,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      next(error);
    }
  };

  createAdjustment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const access_token = req.headers.authorization.split(' ')[1];
      const userId = await tokenValidator(access_token);

      const { productId, warehouseId, quantity, reason, notes } = req.body;

      let quantityRecord = await Quantity.findOne({
        warehouseId,
        productId,
      });

      quantityRecord.quantity -= quantity;
      await quantityRecord.save({ session });

      const transaction = new Transaction({
        type: 'ADJUSTMENT',
        product: productId,
        quantity,
        reason,
        notes,
        destinationWarehouse: warehouseId,
        performedBy: userId._id,
      });

      const createdTransaction = await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Stock adjustment recorded successfully',
        transaction: createdTransaction,
        updatedQuantity: quantityRecord,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
}
