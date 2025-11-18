import Quantity from '../models/quantityModel.js';
import Product from '../models/productModel.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';
import { subDays, eachDayOfInterval, format } from 'date-fns';
export default class DashboardController {
  getTopProducts = async (req, res, next) => {
    try {
      const selectedWarehouseId = req.params.selectedWarehouse;
      const objectId = new mongoose.Types.ObjectId(selectedWarehouseId);

      const topProducts = await Quantity.aggregate([
        {
          $match: {
            warehouseId: objectId,
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
      const productsCategory = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            totalProducts: { $sum: 1 },
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
      const transactionDetail = await this.getDaysTransaction();

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

  getDaysTransaction = async () => {
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
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), //converting into milliseconds.
          },
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
}
