import Transaction from '../models/transactionModel.js';
import Quantity from '../models/quantityModel.js';
// import Notifications from '../utils/Notifications.js';
import BrowserNotification from '../utils/BrowserNotification.js';
import mongoose from 'mongoose';
import generatePdf from '../services/generatePdf.js';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import Warehouse from '../models/warehouseModel.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';

// const notifications = new Notifications();
const browserNotification = new BrowserNotification();

export default class TransactionController {
  getTransactions = async (req, res, next) => {
    try {
      const {
        startDate,
        endDate,
        type,
        status,
        page = 1,
        limit = 10,
      } = req.query;
      const user = req.user; // authenticated user

      const matchStage = {};

      if (startDate || endDate) {
        matchStage.createdAt = {};

        if (startDate) {
          matchStage.createdAt.$gte = new Date(startDate);
        }

        if (endDate) {
          // Set $lte to the last millisecond of the given day (23:59:59.999)
          matchStage.createdAt.$lte = new Date(
            new Date(endDate).setHours(23, 59, 59, 999)
          );
        }
      }

      if (type && type !== 'ALL') {
        matchStage.type = type;
      }

      if (status && status !== 'ALL') {
        matchStage.shipment = status;
      }

      // Manager warehouse restriction
      if (user.role === 'manager') {
        // Find all warehouses managed by this manager
        const warehouses = await Warehouse.find({
          managerIds: user._id,
        }).select('_id');
        const warehouseIds = warehouses.map((warehouse) => warehouse._id);

        matchStage.$or = [
          { sourceWarehouse: { $in: warehouseIds } },
          { destinationWarehouse: { $in: warehouseIds } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await Transaction.find(matchStage)
        .populate('product performedBy sourceWarehouse destinationWarehouse')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalCount = await Transaction.countDocuments(matchStage);

      const typeCounts = await Transaction.aggregate([
        { $match: matchStage },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const statusCounts = await Transaction.aggregate([
        { $match: matchStage },
        { $group: { _id: '$shipment', count: { $sum: 1 } } },
      ]);

      res.status(200).json({
        success: true,
        message: 'Transactions fetched successfully',
        data: {
          transactions,
          counts: {
            types: typeCounts,
            status: statusCounts,
          },
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getWarehouseSpecificTransactions = async (req, res, next) => {
    try {
      const { warehouseId } = req.params;
      const {
        startDate,
        endDate,
        type,
        status,
        page = 1,
        limit = 10,
      } = req.query;
      const warehouseObjectId = new mongoose.Types.ObjectId(`${warehouseId}`);
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const dateFilter = {};

      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }

      if (endDate) {
        // Set $lte to the last millisecond of the given day (23:59:59.999)
        dateFilter.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }

      const filter = {
        $or: [
          { sourceWarehouse: warehouseObjectId },
          { destinationWarehouse: warehouseObjectId },
        ],
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      };

      if (type && type !== 'ALL') {
        filter.type = type;
      }

      if (status && status !== 'ALL') {
        filter.shipment = status;
      }

      const transactions = await Transaction.aggregate([
        { $match: filter },
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
        {
          $unwind: {
            path: '$performedBy',
            // preserveNullAndEmptyArrays: true
          },
        },
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
        { $skip: skip },
        { $limit: parseInt(limit) },
        { $sort: { createdAt: -1 } },
      ]);

      const totalCount = await Transaction.countDocuments(filter);

      const typeCounts = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const statusCounts = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: '$shipment', count: { $sum: 1 } } },
      ]);
      res.status(200).json({
        success: true,
        message: 'Warehouse-specific transactions fetched successfully',
        data: {
          transactions,
          counts: {
            types: typeCounts,
            status: statusCounts,
          },
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createStockIn = async (req, res, next) => {
    let session;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

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

      res.status(201).json({
        success: true,
        message: 'Stock-in transactions created successfully',
        data: transactions,
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };

  createStockOut = async (req, res, next) => {
    let session;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

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
      const lowStockNotifications = [];

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

        if (quantity > quantityRecord.limit) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Stock out Quantity exceeded Product Limit: ${quantityRecord.limit}`,
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
          shipment: SHIPMENT_TYPES.PENDING,
          sourceWarehouse,
          orderNumber,
          notes,
          performedBy: req.userId,
        });

        const createdTransaction = await transaction.save({ session });
        transactions.push(createdTransaction);

        // await notifications.notifyPendingShipment(
        //   productId,
        //   sourceWarehouse,
        //   createdTransaction._id
        // );

        // await browserNotification.notifyPendingShipment(
        //   productId,
        //   sourceWarehouse,
        //   createdTransaction._id
        // );

        // if (
        //   quantityRecord.quantity <= quantityRecord.limit &&
        //   previousQty > quantityRecord.limit
        // ) {
        //   // await notifications.notifyLowStock(productId, sourceWarehouse);
        //   await browserNotification.notifyLowStock(productId, sourceWarehouse);
        //   console.log('Browser notification called!');
        // }
        if (
          quantityRecord.quantity <= quantityRecord.limit &&
          previousQty > quantityRecord.limit
        ) {
          lowStockNotifications.push({
            productId,
            warehouseId: sourceWarehouse,
          });
        }
      }

      await session.commitTransaction();

      // Send notifications after transaction commit
      for (const createdTransaction of transactions) {
        await browserNotification.notifyPendingShipment(
          createdTransaction.product,
          createdTransaction.sourceWarehouse,
          createdTransaction._id
        );
      }

      for (const notification of lowStockNotifications) {
        await browserNotification.notifyLowStock(
          notification.productId,
          notification.warehouseId
        );
      }

      res.status(201).json({
        success: true,
        message: 'Stock-out transactions created successfully',
        data: transactions,
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };

  createTransfer = async (req, res, next) => {
    let session;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

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
          console.log('notify low stock should be called');
          // await Notifications.notifyLowStock(productId, sourceWarehouse);
          await browserNotification.notifyLowStock(productId, sourceWarehouse);
        }
      }

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: 'Stock transfer completed successfully',
        data: { transactions, updatedQuantities },
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };

  createAdjustment = async (req, res, next) => {
    let session;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

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

      if (
        quantityRecord.quantity <= quantityRecord.limit &&
        prevQty > quantityRecord.limit
      ) {
        //await Notifications.notifyLowStock(productId, warehouseId);
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
      next(error);
    } finally {
      session.endSession();
    }
  };

  generateInvoice = async (req, res, next) => {
    try {
      const transaction = await Transaction.findById(req.params.id).populate(
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
