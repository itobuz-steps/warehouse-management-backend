import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Quantity from '../models/quantityModel.js';

export default class ProductController {
  getProducts = async (req, res, next) => {
    try {
      const products = await Product.find({ isArchived: false }).populate(
        'createdBy'
      );

      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        res.status(404);
        res.json({ success: false });
        throw new Error('Product not found');
      }
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const { name, category, description, price } = req.body;

      const createdBy = new mongoose.Types.ObjectId(req.body.createdBy);

      const product = await Product.create({
        name,
        category,
        description,
        price,
        productImage: req.files.map((f) => f.path),
        createdBy,
      });

      res.status(201).json({
        message: 'Product Successfully Saved',
        success: true,
        product,
      });
    } catch (err) {
      res.status(400);
      next(err);
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const id = req.params;
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id },
        { isArchived: true },
        { new: true }
      );

      if (!updatedProduct) {
        res.status(404);
        res.json({ success: false });
        throw new Error('Product not found');
      }

      res.status(200).json({
        success: true,
        message: 'Product archived successfully',
        product: updatedProduct,
      });
    } catch (err) {
      next(err);
    }
  };

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

  getProductQuantityAcrossAllWarehouse = async (req, res, next) => {
    try {
      const productId = req.params.productId;

      const result = await Quantity.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: productId, quantity: { $sum: '$quantity' } } },
      ]);

      res.status(200).json(result);
    } catch (err) {
      res.status(500);
      next(err);
    }
  };
}

getProductQuantityAcrossAllWarehouse = async (req, res, next) => {
  try {
    const { productId, warehouseId } = req;
  } catch (err) {}
};
