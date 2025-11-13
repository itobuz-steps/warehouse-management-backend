import Quantity from '../models/quantityModel.js';

export default class DashboardController {
  getTopProducts = async (req, res, next) => {
    try {
      const topProducts = await Quantity.aggregate([
        { $sort: { quantity: -1 } },
        { $limit: 5 },
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
          $project: {
            _id: 0,
            productId: 1,
            quantity: 1,
            productName: '$product.name',
            category: '$product.category',
            price: '$product.price',
          },
        },
      ]);
      res.status(200).json({ message: 'Data fetched successfully',
        success: true,
        topProducts });
    } catch (err) {
      next(err);
    }
  };

  
}
