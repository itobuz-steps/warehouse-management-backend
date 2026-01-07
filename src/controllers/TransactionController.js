import Transaction from '../models/transactionModel.js';
import Quantity from '../models/quantityModel.js';
// import Notifications from '../utils/Notifications.js';
import Notification from '../utils/Notification.js';
import mongoose from 'mongoose';
import generatePdf from '../services/generatePdf.js';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import Warehouse from '../models/warehouseModel.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';
import Product from '../models/productModel.js';
import USER_TYPES from '../constants/userConstants.js';

// const notifications = new Notifications();
const notification = new Notification();

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
      let warehouseMatch = {};

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
      if (user.role === USER_TYPES.MANAGER) {
        // Find all warehouses managed by this manager
        const warehouses = await Warehouse.find({
          managerIds: user._id,
        }).select('_id');
        const warehouseIds = warehouses.map((warehouse) => warehouse._id);

        warehouseMatch = {
          $or: [
            { sourceWarehouse: { $in: warehouseIds } },
            { destinationWarehouse: { $in: warehouseIds } },
          ],
        };

        // apply to main query
        Object.assign(matchStage, warehouseMatch);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await Transaction.find(matchStage)
        .populate('product performedBy sourceWarehouse destinationWarehouse')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await Transaction.countDocuments(matchStage);

      const typeCounts = await Transaction.aggregate([
        { $match: warehouseMatch },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const statusCounts = await Transaction.aggregate([
        {
          $match: {
            ...warehouseMatch,
            type: TRANSACTION_TYPES.OUT,
          },
        },
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
            totalPages: Math.ceil(totalCount / parseInt(limit)),
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
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
      ]);

      const totalCount = await Transaction.countDocuments(filter);

      const typeCounts = await Transaction.aggregate([
        {
          $match: {
            $or: [
              { sourceWarehouse: warehouseObjectId },
              { destinationWarehouse: warehouseObjectId },
            ],
          },
        },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const statusCounts = await Transaction.aggregate([
        {
          $match: {
            $or: [
              { sourceWarehouse: warehouseObjectId },
              { destinationWarehouse: warehouseObjectId },
            ],
            type: TRANSACTION_TYPES.OUT,
          },
        },
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
            totalPages: Math.ceil(totalCount / parseInt(limit)),
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

      // Send notifications after transaction commit
      for (const createdTransaction of transactions) {
        await notification.notifyTransaction(
          createdTransaction.product,
          createdTransaction.destinationWarehouse,
          createdTransaction._id,
          createdTransaction.quantity,
          NOTIFICATION_TYPES.STOCK_IN,
          req.userId
        );
      }

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
    let transactionStarted = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();
      transactionStarted = true;

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

        const product = await Product.findById(productId);
        const quantityRecord = await Quantity.findOne({
          warehouseId: sourceWarehouse,
          productId,
        });

        if (quantityRecord.quantity < quantity) {
          await session.abortTransaction();
          transactionStarted = false;
          return res.status(400).json({
            message: `Insufficient stock for Product: ${product.name}. Available: ${quantityRecord.quantity}, Requested: ${quantity}`,
          });
        }

        if (quantity > quantityRecord.limit) {
          await session.abortTransaction();
          transactionStarted = false;
          return res.status(400).json({
            message: `Stock out Quantity exceeded for Product: ${product.name}, Limit: ${quantityRecord.limit}`,
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

        if (
          quantityRecord.quantity <= quantityRecord.limit &&
          previousQty > quantityRecord.limit
        ) {
          lowStockNotifications.push({
            productId,
            warehouseId: sourceWarehouse,
            transactionPerformedBy: req.userId,
          });
        }
      }

      await session.commitTransaction();
      transactionStarted = false;

      // Send notifications after transaction commit
      for (const createdTransaction of transactions) {
        await notification.notifyPendingShipment(
          createdTransaction.product,
          createdTransaction.sourceWarehouse,
          createdTransaction._id,
          createdTransaction.quantity,
          req.userId
        );
      }

      for (const notif of lowStockNotifications) {
        await notification.notifyLowStock(
          notif.productId,
          notif.warehouseId,
          req.userId
        );
      }

      res.status(201).json({
        success: true,
        message: 'Stock-out transactions created successfully',
        data: transactions,
      });
    } catch (error) {
      if (transactionStarted) {
        await session.abortTransaction();
      }
      next(error);
    } finally {
      session.endSession();
    }
  };

  createTransfer = async (req, res, next) => {
    let session;
    let transactionStarted = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();
      transactionStarted = true;

      const { products, notes, sourceWarehouse, destinationWarehouse } =
        req.body;

      if (sourceWarehouse === destinationWarehouse) {
        return res.status(400).json({
          message: 'Source and destination warehouses cannot be the same',
        });
      }

      const transactions = [];
      const updatedQuantities = [];

      for (const { productId, quantity, limit } of products) {
        const product = await Product.findById(productId);

        const sourceQuantity = await Quantity.findOne({
          warehouseId: sourceWarehouse,
          productId,
        });

        if (!sourceQuantity) {
          await session.abortTransaction();
          transactionStarted = false;
          res.status(404).json({
            success: false,
          });
          throw new Error(`Product ${productId} not found in source warehouse`);
        }

        if (sourceQuantity.quantity < quantity) {
          await session.abortTransaction();
          transactionStarted = false;
          return res.status(400).json({
            message: `Insufficient stock for Product: ${product.name}. Available: ${sourceQuantity.quantity}, Requested: ${quantity}`,
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
            limit: limit ?? 10,
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
          await notification.notifyLowStock(
            productId,
            sourceWarehouse,
            req.userId
          );
        }
      }

      await session.commitTransaction();
      transactionStarted = false;

      // Send notifications after transaction commit
      for (const createdTransaction of transactions) {
        await notification.notifyTransaction(
          createdTransaction.product,
          createdTransaction.sourceWarehouse,
          createdTransaction._id,
          createdTransaction.quantity,
          NOTIFICATION_TYPES.STOCK_TRANSFER,
          req.userId
        );
      }

      res.status(201).json({
        success: true,
        message: 'Stock transfer completed successfully',
        data: { transactions, updatedQuantities },
      });
    } catch (error) {
      if (transactionStarted) {
        await session.abortTransaction();
      }
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
        await notification.notifyLowStock(productId, warehouseId, req.userId);
      }

      await notification.notifyTransaction(
        createdTransaction.product,
        createdTransaction.destinationWarehouse,
        createdTransaction._id,
        createdTransaction.quantity,
        NOTIFICATION_TYPES.STOCK_ADJUSTMENT,
        req.userId
      );

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
