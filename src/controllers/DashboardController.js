import Quantity from '../models/quantityModel.js';
import Product from '../models/productModel.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';
import { subDays, eachDayOfInterval, format } from 'date-fns';
export default class DashboardController {
  getTopProducts = async (req, res, next) => {
    try {
      const warehouseId = new mongoose.Types.ObjectId(req.params.warehouseId);

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
        { $limit: 5 },
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
          $project: {
            _id: 0,
            productId: '$_id',
            totalQuantity: 1,
            productName: '$product.name',
            category: '$product.category',
            price: '$product.price',
          },
        },
      ]);

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        topProducts,
      });
    } catch (err) {
      res.status(400);
      next(err);
    }
  };

  getInventoryByCategory = async (req, res, next) => {
    try {
      const warehouseId = new mongoose.Types.ObjectId(req.params.warehouseId);

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
          $group: {
            _id: '$product.category',
            totalProducts: { $sum: 1 },
            products: { $push: '$product' },
          },
        },
      ]);

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        productsCategory,
      });
    } catch (err) {
      res.status(400);
      next(err);
    }
  };

  getProductTransaction = async (req, res, next) => {
    try {
      const warehouseId = new mongoose.Types.ObjectId(req.params.warehouseId);

      const transactionDetail = await this.getDaysTransaction(warehouseId);

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        transactionDetail,
      });
    } catch (err) {
      res.status(400);
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
            { type: 'IN', destinationWarehouse: warehouseId },
            { type: 'OUT', sourceWarehouse: warehouseId },
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
            $sum: { $cond: [{ $eq: ['$_id.type', 'IN'] }, '$total', 0] },
          },
          OUT: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'OUT'] }, '$total', 0] },
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
      const warehouseId = new mongoose.Types.ObjectId(req.params.warehouseId);

      //for sales overview.
      const sales = await Transaction.aggregate([
        { $match: { type: 'OUT', sourceWarehouse: warehouseId } },

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
            type: 'IN',
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
            type: 'OUT',
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
      res.status(400);
      next(err);
    }
  };

  getLowStockProducts = async (req, res, next) => {
    try {
      const warehouseId = new mongoose.Types.ObjectId(req.params.warehouseId);

      const lowStockProducts = await Quantity.aggregate([
        {
          $match: {
            warehouseId: warehouseId,
            quantity: { $lte: 5 },
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
      res.status(400);
      next(err);
    }
  };
}
