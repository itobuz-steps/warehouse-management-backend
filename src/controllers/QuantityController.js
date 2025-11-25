import mongoose from 'mongoose';
import Quantity from '../models/quantityModel.js';

export default class QuantityController {
  // adding a product in a specific warehouse
  addProductQuantity = async (req, res, next) => {
    try {
      const productId = req.body.productId;
      const warehouseId = req.body.warehouseId;
      const { quantity, limit } = req.body;
      const quantityObj = {
        productId,
        warehouseId,
        quantity,
        limit,
      };

      let result = await Quantity.create(quantityObj);

      result = await Quantity.findById({ _id: result._id }).populate(
        'warehouseId productId'
      );

      res.status(200).json({
        message: 'Product Quantity Updated',
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // getting total quantity of a product across all warehouse
  getTotalProductQuantity = async (req, res, next) => {
    try {
      const productId = req.params.productId;

      const result = await Quantity.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(`${productId}`) } },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        { $match: { 'product.isArchived': false } },
        {
          $group: {
            _id: productId,
            quantity: { $sum: '$quantity' },
          },
        },
      ]);

      res.status(200).json({
        message: 'All Product Total Quantity',
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // getting quantity details of a specific product in a specific warehouse -> for Managers
  getProductQuantityAcrossSpecificWarehouse = async (req, res, next) => {
    try {
      const { productId, warehouseId } = req.query;

      const result = await Quantity.find({ productId, warehouseId })
        .populate({
          path: 'productId',
          match: { isArchived: false },
        })
        .populate('warehouseId');

      res.status(200).json({
        message: 'Warehouse Specific Product Quantity',
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // Get all products in a specific warehouse -> for Managers
  getWarehouseSpecificProducts = async (req, res, next) => {
    try {
      const warehouseId = req.params.warehouseId;

      const result = await Quantity.aggregate([
        {
          $match: {
            warehouseId: new mongoose.Types.ObjectId(`${warehouseId}`),
          },
        },
        {
          $lookup: {
            from: 'products', // collection name in MongoDB
            localField: 'productId', // field in Quantity Model
            foreignField: '_id', // field in Product Model
            as: 'product', // output field where product details gonna stored
          },
        },
        { $unwind: '$product' }, // converts array → object
        { $match: { 'product.isArchived': false } },
      ]);

      res.status(200).json({
        message: 'Specific Warehouse all products',
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // get warehouses where a specific product is stored
  getProductSpecificWarehouses = async (req, res, next) => {
    try {
      const productId = req.params.productId;

      const result = await Quantity.find({ productId })
        .populate({
          path: 'productId',
          match: { isArchived: false },
        })
        .populate('warehouseId');

      res.status(200).json({
        message: 'Warehouse where that specific Product is stored',
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getProductsHavingQuantity = async (req, res, next) => {
    try {
      const { search, category, sort, warehouseId } = req.query;

      const pipeline = [];

      if (warehouseId) {
        pipeline.push({
          $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) },
        });
      }

      // Lookup products
      pipeline.push(
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },

        // Remove archived products
        {
          $match: { 'product.isArchived': false },
        }
      );

      if (search) {
        pipeline.push({
          $match: {
            'product.name': { $regex: search, $options: 'i' },
          },
        });
      }

      if (category) {
        pipeline.push({
          $match: {
            'product.category': category,
          },
        });
      }

      if (sort === 'name_asc') {
        pipeline.push({ $sort: { 'product.name': 1 } });
      } else if (sort === 'name_desc') {
        pipeline.push({ $sort: { 'product.name': -1 } });
      } else if (sort === 'category_asc') {
        pipeline.push({ $sort: { 'product.category': 1 } });
      } else if (sort === 'quantity_asc' || sort === 'quantity_desc') {
        const order = sort === 'quantity_asc' ? 1 : -1;

        pipeline.push(
          {
            $group: {
              _id: '$productId',
              product: { $first: '$product' },
              totalQuantity: { $sum: '$quantity' },
            },
          },
          { $sort: { totalQuantity: order } },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  '$product',
                  { totalQuantity: '$totalQuantity' },
                ],
              },
            },
          }
        );

        const result = await Quantity.aggregate(pipeline);

        return res.status(200).json({
          success: true,
          data: result,
        });
      }

      pipeline.push({
        $replaceRoot: { newRoot: '$product' },
      });

      const result = await Quantity.aggregate(pipeline);

      res.status(200).json({
        message: 'Products with quantity information',
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
