import Quantity from '../models/quantityModel.js';
// import Product from '../models/productModel.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';
import { subDays, eachDayOfInterval, format } from 'date-fns';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';
import {
  generateTopFiveProductsExcel,
  generateInventoryByCategoryExcel,
  generateWeeklyTransactionExcel,
} from '../services/generateExcel.js';

export default class DashboardController {
  // Top 5 Product Data and Export - Bar Chart
  getTopFiveProducts = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const topProducts = await this.getTopFiveProductsData(
        req.params.warehouseId
      );

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        data: topProducts,
      });
    } catch (err) {
      next(err);
    }
  };

  generateTopFiveProductsExcel = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const topProducts = await this.getTopFiveProductsData(
        req.params.warehouseId
      );
      const result = await generateTopFiveProductsExcel(topProducts);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=top-products.xlsx'
      );

      // Send the file buffer
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  };

  getTopFiveProductsData = async (id) => {
    try {
      const warehouseId = new mongoose.Types.ObjectId(`${id}`);

      const topProducts = await Quantity.aggregate([
        {
          $match: {
            warehouseId: warehouseId,
          },
        },
        {
          $group: {
            _id: '$productId',
            totalQuantity: { $sum: '$quantity' },
          },
        },

        { $sort: { totalQuantity: -1 } },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },

        { $unwind: '$product' },
        {
          $match: {
            'product.isArchived': false,
          },
        },

        {
          $project: {
            _id: 0,
            productId: '$_id',
            totalQuantity: 1,
            productName: '$product.name',
            category: '$product.category',
            price: '$product.price',
          },
        },
        { $limit: 5 },
      ]);

      return topProducts;
    } catch (err) {
      return err;
    }
  };

  // Inventory by Category - Pie Chart
  getInventoryByCategory = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const productsCategory = await this.getInventoryByCategoryData(
        req.params.warehouseId
      );

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        data: productsCategory,
      });
    } catch (err) {
      next(err);
    }
  };

  getInventoryByCategoryExcel = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const productsCategory = await this.getInventoryByCategoryData(
        req.params.warehouseId
      );

      const result = await generateInventoryByCategoryExcel(productsCategory);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=inventory-category.xlsx'
      );

      // Send the file buffer
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  };

  getInventoryByCategoryData = async (id) => {
    try {
      const warehouseId = new mongoose.Types.ObjectId(`${id}`);

      const productsCategory = await Quantity.aggregate([
        {
          $match: { warehouseId: warehouseId },
        },

        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $match: {
            'product.isArchived': false,
          },
        },
        {
          $group: {
            _id: '$product.category',
            totalProducts: { $sum: '$quantity' },
            products: { $push: '$product' },
          },
        },
      ]);

      return productsCategory;
    } catch (err) {
      return err;
    }
  };

  // Transaction Part - Line Chart
  getProductTransaction = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const warehouseId = new mongoose.Types.ObjectId(
        `${req.params.warehouseId}`
      );

      const transactionDetails = await this.getDaysTransaction(warehouseId);

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        data: transactionDetails,
      });
    } catch (err) {
      next(err);
    }
  };

  getProductTransactionExcel = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const warehouseId = new mongoose.Types.ObjectId(
        `${req.params.warehouseId}`
      );

      const transactionDetails = await this.getDaysTransaction(warehouseId);

      const result = await generateWeeklyTransactionExcel(transactionDetails);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=inventory-category.xlsx'
      );

      // Send the file buffer
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  };

  getDaysTransaction = async (warehouseId) => {
    const start = subDays(new Date(), 6); //6 days before
    const end = new Date(); //today

    //template of last 7 days.
    const sevenDays = eachDayOfInterval({ start, end }).map((d) => ({
      _id: format(d, 'yyyy-MM-dd'),
      IN: 0,
      OUT: 0,
    }));

    const daysTransaction = await Transaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          $or: [
            { type: TRANSACTION_TYPES.IN, destinationWarehouse: warehouseId },
            { type: TRANSACTION_TYPES.OUT, sourceWarehouse: warehouseId },
          ],
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            type: '$type',
          },
          total: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.day',
          IN: {
            $sum: {
              $cond: [
                { $eq: ['$_id.type', TRANSACTION_TYPES.IN] },
                '$total',
                0,
              ],
            },
          },
          OUT: {
            $sum: {
              $cond: [
                { $eq: ['$_id.type', TRANSACTION_TYPES.OUT] },
                '$total',
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    daysTransaction.forEach((item) => {
      const day = sevenDays.find((d) => d._id === item._id);
      if (day) {
        day.IN = item.IN;
        day.OUT = item.OUT;
      }
    });

    return sevenDays;
  };

  getTransactionStats = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const warehouseId = new mongoose.Types.ObjectId(
        `${req.params.warehouseId}`
      );

      //for sales overview.
      const sales = await Transaction.aggregate([
        {
          $match: { type: TRANSACTION_TYPES.OUT, sourceWarehouse: warehouseId },
        },

        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productData',
          },
        },

        { $unwind: '$productData' },

        {
          $group: {
            _id: null,
            totalSales: {
              $sum: {
                $multiply: ['$quantity', '$productData.price'],
              },
            },
            saleQuantity: { $sum: '$quantity' },
          },
        },

        {
          $project: {
            _id: 0,
            totalSales: 1,
            saleQuantity: 1,
          },
        },
      ]);

      //for purchase overview
      const purchase = await Transaction.aggregate([
        {
          $match: {
            type: TRANSACTION_TYPES.IN,
            destinationWarehouse: warehouseId,
          },
        },

        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productData',
          },
        },

        {
          $unwind: '$productData',
        },

        {
          $group: {
            _id: null,
            totalPurchase: {
              $sum: { $multiply: ['$quantity', '$productData.price'] },
            },
            purchaseQuantity: { $sum: '$quantity' },
          },
        },
        {
          $project: {
            _id: 0,
            totalPurchase: 1,
            purchaseQuantity: 1,
          },
        },
      ]);

      //for inventory summary.
      const inventory = await Quantity.aggregate([
        {
          $match: {
            warehouseId: warehouseId,
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        {
          $unwind: '$product',
        },
        {
          $match: {
            'product.isArchived': false,
          },
        },

        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
          },
        },
        {
          $project: {
            _id: 0,
            totalQuantity: 1,
          },
        },
      ]);

      const dayStarting = new Date();
      dayStarting.setHours(0, 0, 0, 0);

      const now = new Date();

      const todayShipment = await Transaction.aggregate([
        {
          $match: {
            sourceWarehouse: warehouseId,
            type: TRANSACTION_TYPES.OUT,
            createdAt: { $gte: dayStarting, $lte: now },
          },
        },
        {
          $group: {
            _id: null,
            quantity: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            quantity: 1,
          },
        },
      ]);

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        data: {
          sales: sales[0],
          purchase: purchase[0],
          inventory: inventory[0],
          todayShipment: todayShipment[0],
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // Low Stock Product Table
  getLowStockProducts = async (req, res, next) => {
    try {
      if (!req.params?.warehouseId) {
        res.status(404);
        throw new Error('warehouse Id not found!');
      }

      const warehouseId = new mongoose.Types.ObjectId(
        `${req.params.warehouseId}`
      );

      const lowStockProducts = await Quantity.aggregate([
        {
          $match: {
            warehouseId: warehouseId,
          },
        },
        {
          // Compare two fields: quantity <= limit
          $match: {
            $expr: { $lte: ['$quantity', '$limit'] },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'productData',
          },
        },

        {
          $unwind: '$productData',
        },

        {
          $match: {
            'productData.isArchived': false,
          },
        },

        {
          $project: {
            _id: 0,
            quantity: 1,
            productName: '$productData.name',
          },
        },
      ]);

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        data: {
          lowStockProducts,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // Top Selling Products by Warehouse (Stock Out)
  getTopSellingProducts = async (req, res, next) => {
    try {
      const { warehouseId } = req.params;
      const { limit = 5 } = req.query;

      if (!warehouseId) {
        res.status(404);
        throw new Error('Warehouse Id not found!');
      }

      const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

      const topSellingProducts = await Transaction.aggregate([
        {
          $match: {
            type: TRANSACTION_TYPES.OUT,
            sourceWarehouse: warehouseObjectId,
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $match: {
            'product.isArchived': false,
          },
        },
        {
          $group: {
            _id: '$product._id',
            productName: { $first: '$product.name' },
            category: { $first: '$product.category' },
            price: { $first: '$product.price' },
            totalSoldQuantity: { $sum: '$quantity' },
            totalSalesAmount: {
              $sum: { $multiply: ['$quantity', '$product.price'] },
            },
            productImage: { $first: '$product.productImage' },
          },
        },
        { $sort: { totalSoldQuantity: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            productName: 1,
            category: 1,
            price: 1,
            totalSoldQuantity: 1,
            totalSalesAmount: 1,
            productImage: { $arrayElemAt: ['$productImage', 0] },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        message: 'Top selling products fetched successfully',
        data: topSellingProducts,
      });
    } catch (error) {
      next(error);
    }
  };

  // Most Cancelled Products by Warehouse
  getMostCancelledProducts = async (req, res, next) => {
    try {
      const { warehouseId } = req.params;
      const { limit = 5, startDate, endDate } = req.query;

      if (!warehouseId) {
        res.status(404);
        throw new Error('Warehouse Id not found!');
      }

      const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

      const match = {
        shipment: SHIPMENT_TYPES.CANCELLED,
        sourceWarehouse: warehouseObjectId,
      };

      if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) {
          match.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const d = new Date(endDate);
          d.setHours(23, 59, 59, 999);
          match.createdAt.$lte = d;
        }
      }

      const mostCancelledProducts = await Transaction.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        { $match: { 'product.isArchived': false } },
        {
          $group: {
            _id: '$product._id',
            productName: { $first: '$product.name' },
            category: { $first: '$product.category' },
            totalCancelledQuantity: { $sum: '$quantity' },
          },
        },
        { $sort: { totalCancelledQuantity: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            productName: 1,
            category: 1,
            totalCancelledQuantity: 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        message: 'Most cancelled products fetched successfully',
        data: mostCancelledProducts,
      });
    } catch (error) {
      next(error);
    }
  };

  // Most Adjusted Products by Warehouse
  getMostAdjustedProducts = async (req, res, next) => {
    try {
      const { warehouseId } = req.params;
      const { limit = 5 } = req.query;

      if (!warehouseId) {
        res.status(404);
        throw new Error('Warehouse Id not found!');
      }

      const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

      const mostAdjustedProducts = await Transaction.aggregate([
        {
          $match: {
            type: TRANSACTION_TYPES.ADJUSTMENT,
            destinationWarehouse: warehouseObjectId,
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $match: {
            'product.isArchived': false,
          },
        },
        {
          $group: {
            _id: '$product._id',
            productName: { $first: '$product.name' },
            category: { $first: '$product.category' },
            totalAdjustedQuantity: { $sum: '$quantity' },
          },
        },
        { $sort: { totalAdjustedQuantity: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            productName: 1,
            category: 1,
            totalAdjustedQuantity: 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        message: 'Most adjusted products fetched successfully',
        data: mostAdjustedProducts,
      });
    } catch (error) {
      next(error);
    }
  };

  // Profit Loss Chart in a given timeline
  getProfitLossAnalytics = async (req, res, next) => {
    try {
      const { period = 'week', warehouseId, from, to } = req.query;

      let start, end, totalDays;

      const now = new Date();

      // Find Range
      if (from && to) {
        start = new Date(from);
        start.setHours(0, 0, 0, 0);

        end = new Date(to);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
          return res.status(400).json({
            success: false,
            message: '`from` date must be before `to` date',
          });
        }

        totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      } else {
        // Find Period like week and month
        if (!['week', 'month'].includes(period)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid period. Allowed values: week, month',
          });
        }

        end = now;
        start = new Date();
        start.setHours(0, 0, 0, 0);

        totalDays = period === 'week' ? 7 : 30;
        start.setDate(start.getDate() - (totalDays - 1));
      }

      // Match with start and end duration
      const matchStage = {
        createdAt: { $gte: start, $lte: end },
      };

      if (warehouseId) {
        matchStage.$or = [
          { sourceWarehouse: new mongoose.Types.ObjectId(warehouseId) },
          { destinationWarehouse: new mongoose.Types.ObjectId(warehouseId) },
        ];
      }

      // Aggregation Logic to Find Data
      const pipeline = [
        { $match: matchStage },

        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },

        // Profit Loss Data Processing
        {
          $addFields: {
            profitAmount: {
              $cond: [
                {
                  $in: [
                    '$type',
                    [TRANSACTION_TYPES.OUT, TRANSACTION_TYPES.TRANSFER],
                  ],
                },
                {
                  $multiply: [
                    '$quantity',
                    {
                      $multiply: [
                        '$product.price',
                        { $add: [1, { $divide: ['$product.markup', 100] }] },
                      ],
                    },
                  ],
                },
                0,
              ],
            },
            lossAmount: {
              $cond: [
                {
                  $in: [
                    '$type',
                    [TRANSACTION_TYPES.IN, TRANSACTION_TYPES.ADJUSTMENT],
                  ],
                },
                { $multiply: ['$quantity', '$product.price'] },
                0,
              ],
            },
          },
        },

        // Group by Day
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'Asia/Kolkata', // Local Time Date
              },
            },
            profit: { $sum: '$profitAmount' },
            loss: { $sum: '$lossAmount' },
          },
        },

        {
          $project: {
            _id: 0,
            label: '$_id',
            profit: { $round: ['$profit', 2] },
            loss: { $round: ['$loss', 2] },
            net: { $round: [{ $subtract: ['$profit', '$loss'] }, 2] }, // For net Transaction value
          },
        },
      ];

      const dbData = await Transaction.aggregate(pipeline);

      // Fill missing days that not provided and fill data with default value
      const map = {};
      dbData.forEach((d) => (map[d.label] = d));

      const finalData = [];

      for (let i = 0; i < totalDays; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const label = this.formatDateLocal(date);

        finalData.push(
          map[label] || {
            label,
            profit: 0,
            loss: 0,
            net: 0,
          }
        );
      }

      res.json({
        success: true,
        message: 'Profit & Loss Analytics',
        data: finalData,
      });
    } catch (err) {
      next(err);
    }
  };

  formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
}
