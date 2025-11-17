import Quantity from '../models/quantityModel.js';
import Product from '../models/productModel.js';

export default class DashboardController {
  getTopProducts = async (req, res, next) => {
    try {
      const topProducts = await Quantity.aggregate([
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
        }
      ]);

      res.status(200).json({
        message: 'Data fetched successfully',
        success: true,
        productsCategory
      });

    } catch (err) {
      next(err);
    }
  };

  
}
