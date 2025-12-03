import Quantity from '../models/quantityModel.js';
// import Product from '../models/productModel.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';
import { subDays, eachDayOfInterval, format } from 'date-fns';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import {
  generateTopFiveProductsExcelData,
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

      const topProducts = await this.getTopFiveProductsData();
      const result = await generateTopFiveProductsExcelData(topProducts);

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
        { $limit: 5 }
      ]);

      return topProducts;
    } catch (err) {
      console.error(err);
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
            totalProducts: { $sum: '$quantity'},
            products: { $push: '$product' },
          },
        },
      ]);
      console.log(productsCategory);

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

      console.log(todayShipment);

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
            quantity: { $lte: 10 },
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
}
