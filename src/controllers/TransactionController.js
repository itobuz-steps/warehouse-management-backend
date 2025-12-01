import Transaction from '../models/transactionModel.js';
import Quantity from '../models/quantityModel.js';
import Notifications from '../utils/Notifications.js';
import BrowserNotification from '../utils/browserNotification.js';
import mongoose from 'mongoose';
import generatePdf from '../services/generatePdf.js';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';

const notifications = new Notifications();
const browserNotification = new BrowserNotification();

export default class TransactionController {
  getTransactions = async (req, res, next) => {
    try {
      const transactions = await Transaction.find().populate(
        'product performedBy sourceWarehouse destinationWarehouse'
      );

      res.status(201).json({
        message: 'All Transactions',
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  getWarehouseSpecificTransactions = async (req, res, next) => {
    try {
      const { warehouseId } = req.params;
      const warehouseObjectId = new mongoose.Types.ObjectId(`${warehouseId}`);

      const result = await Transaction.aggregate([
        {
          $match: {
            $or: [
              { sourceWarehouse: warehouseObjectId },
              { destinationWarehouse: warehouseObjectId },
            ],
          },
        },
        // Join with products collection
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        // Join with users (performedBy)
        {
          $lookup: {
            from: 'users',
            localField: 'performedBy',
            foreignField: '_id',
            as: 'performedBy',
          },
        },
        { $unwind: { path: '$performedBy', preserveNullAndEmptyArrays: true } },
        // Join with warehouses
        {
          $lookup: {
            from: 'warehouses',
            localField: 'sourceWarehouse',
            foreignField: '_id',
            as: 'sourceWarehouse',
          },
        },
        {
          $unwind: {
            path: '$sourceWarehouse',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'warehouses',
            localField: 'destinationWarehouse',
            foreignField: '_id',
            as: 'destinationWarehouse',
          },
        },
        {
          $unwind: {
            path: '$destinationWarehouse',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Sort newest first
        { $sort: { createdAt: -1 } },
      ]);

      res.status(200).json({
        success: true,
        message: 'Warehouse-specific transactions fetched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createStockIn = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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
          type: TRANSACTION_TYPES.IN,
          product: productId,
          quantity,
          supplier,
          destinationWarehouse,
          notes,
          performedBy: req.userId,
        });

        const createdTransaction = await transaction.save({ session });
        transactions.push(createdTransaction);
      }

      await session.commitTransaction();

      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Stock-in transactions created successfully',
        data: transactions,
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

        const previousQty = quantityRecord.quantity;

        quantityRecord.quantity -= quantity;
        await quantityRecord.save({ session });

        const transaction = new Transaction({
          type: TRANSACTION_TYPES.OUT,
          product: productId,
          quantity,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          sourceWarehouse,
          orderNumber,
          notes,
          performedBy: req.userId,
        });

        const createdTransaction = await transaction.save({ session });
        transactions.push(createdTransaction);

        await notifications.notifyPendingShipment(
          productId,
          sourceWarehouse,
          createdTransaction._id
        );

        await browserNotification.notifyPendingShipment(
          productId,
          sourceWarehouse,
          createdTransaction._id,
        );

        
        if (
          quantityRecord.quantity <= quantityRecord.limit &&
          previousQty > quantityRecord.limit
        ) {
          await notifications.notifyLowStock(productId, sourceWarehouse);
          await browserNotification.notifyLowStock(productId, sourceWarehouse);
          console.log("Browser notification called!");
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Stock-out transactions created successfully',
        data: transactions,
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
          res.status(404).json({
            success: false,
          });
          throw new Error(`Product ${productId} not found in source warehouse`);
        }

        if (sourceQuantity.quantity < quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Insufficient stock for product ${productId}. Available: ${sourceQuantity.quantity}, Requested: ${quantity}`,
          });
        }

        const prevQty = sourceQuantity.quantity;

        // subtract from source
        sourceQuantity.quantity -= quantity;
        await sourceQuantity.save({ session });

        // destination increase
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

        updatedQuantities.push({ productId, sourceQuantity, destQuantity });

        // Create transaction
        const transaction = new Transaction({
          type: TRANSACTION_TYPES.TRANSFER,
          product: productId,
          quantity,
          notes,
          sourceWarehouse,
          destinationWarehouse,
          performedBy: req.userId,
        });

        const newTx = await transaction.save({ session });
        transactions.push(newTx);

        if (
          sourceQuantity.quantity <= sourceQuantity.limit &&
          prevQty > sourceQuantity.limit
        ) {
          await Notifications.notifyLowStock(productId, sourceWarehouse);
          await browserNotification.notifyLowStock(productId, sourceWarehouse);
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Stock transfer completed successfully',
        data: { transactions, updatedQuantities },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };

  createAdjustment = async (req, res, next) => {
    console.log('Adjust Stock');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { products, warehouseId, reason, notes } = req.body;
      const { productId, quantity } = products[0];

      let quantityRecord = await Quantity.findOne({ warehouseId, productId });

      const prevQty = quantityRecord.quantity;

      // adjust
      quantityRecord.quantity -= quantity;
      await quantityRecord.save({ session });

      const transaction = new Transaction({
        type: TRANSACTION_TYPES.ADJUSTMENT,
        product: productId,
        quantity,
        reason,
        notes,
        destinationWarehouse: warehouseId,
        performedBy: req.userId,
      });

      const createdTransaction = await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      if (
        quantityRecord.quantity <= quantityRecord.limit &&
        prevQty > quantityRecord.limit
      ) {
        await Notifications.notifyLowStock(productId, warehouseId);
        await browserNotification.notifyLowStock(productId, warehouseId);
      }

      res.status(201).json({
        success: true,
        message: 'Stock adjustment recorded successfully',
        data: {
          transaction: createdTransaction,
          updatedQuantity: quantityRecord,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };

  generateInvoice = async (req, res, next) => {
    try {
      const transactionId = req.params.id;

      const transaction = await Transaction.findById(transactionId).populate(
        'product performedBy sourceWarehouse'
      );

      const result = await generatePdf(transaction);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

      res.status(200).send(Buffer.from(result));
    } catch (err) {
      next(err);
    }
  };
}
