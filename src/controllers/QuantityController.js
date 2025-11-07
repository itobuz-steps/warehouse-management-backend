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
        result,
      });
    } catch (err) {
      res.status(500);
      next(err);
    }
  };

  // getting total quantity of a product across all warehouse
  getTotalProductQuantity = async (req, res, next) => {
    try {
      const productId = req.params.productId;

      const result = await Quantity.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: productId,
            quantity: { $sum: '$quantity' },
          },
        },
      ]);

      res.status(200).json(result);
    } catch (err) {
      res.status(500);
      next(err);
    }
  };

  // getting quantity details of a specific product in a specific warehouse -> for Managers
  getProductQuantityAcrossSpecificWarehouse = async (req, res, next) => {
    try {
      const { productId, warehouseId } = req.query;
      console.log(productId, warehouseId);

      const result = await Quantity.find({ productId, warehouseId }).populate(
        'productId warehouseId'
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  // Get all products in a specific warehouse -> for Managers
  getWarehouseSpecificProducts = async (req, res, next) => {
    try {
      const warehouseId = req.params.warehouseId;

      const result = await Quantity.aggregate([
        { $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) } },
        {
          $lookup: {
            from: 'products', // collection name in MongoDB
            localField: 'productId', // field in Quantity Model
            foreignField: '_id', // field in Product Model
            as: 'product', // output field where product details gonna stored
          },
        },
        { $unwind: '$product' }, // converts array → object
      ]);

      console.log(result);
      res.status(200).json(result);
    } catch (err) {
      res.status(500);
      next(err);
    }
  };

  // get warehouses where a specific product is stored
  getProductSpecificWarehouses = async (req, res, next) => {
    try {
      const productId = req.params.productId;

      console.log(productId);

      const result = await Quantity.find({ productId }).populate('warehouseId');
      console.log(result);
      res.status(200).json(result);
    } catch (err) {
      res.status(500);
      next(err);
    }
  };
}
