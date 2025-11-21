import Product from '../models/productModel.js';
import mongoose from 'mongoose';
import Quantity from '../models/quantityModel.js';

export default class ProductController {
  getProducts = async (req, res, next) => {
    try {
      const { search, category, sort, warehouseId } = req.query;

      const filter = { isArchived: false };

      if (category) {
        filter.category = category;
      }

      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }

      if (warehouseId) {
        const quantities = await Quantity.find({ warehouseId }).select(
          'productId'
        );
        const productIds = quantities.map((q) => q.productId);

        if (productIds.length === 0) {
          return res.status(200).json({ success: true, data: [] });
        }

        filter._id = { $in: productIds };
      }

      let query = Product.find(filter).populate('createdBy');

      if (sort) {
        if (sort === 'name_asc') {
          query = query.sort({ name: 1 });
        } else if (sort === 'name_desc') {
          query = query.sort({ name: -1 });
        } else if (sort === 'category_asc') {
          query = query.sort({ category: 1 });
        }
      }

      // If no specific sort is requested, fetch products normally
      const products = await query;
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const id = req.params.id;
      // const { name, category, description, price } = req.body;
      const updates = {};

      // if (name) updates.name = name;
      // if (category) updates.category = category;
      // if (description) updates.description = description;
      // if (price) updates.price = price;

      for (const [key, value] of Object.entries(req.body)) {
        if (value) {
          updates[key] = value;
        }
      }

      if (req.files && req.files.length > 0) {
        updates.productImage = req.files.map(
          (file) => `${req.protocol}://${req.get('host')}/${file.path}`
        );
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        res.status(404);
        throw new Error('Product not found');
      }

      res.status(201).json({
        message: 'Product updated successfully',
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      res.status(400);
      next(error);
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const { name, category, description, price } = req.body;

      const product = await Product.create({
        name,
        category,
        description,
        price,
        productImage: req.files.map(
          (file) => `${req.protocol}://${req.get('host')}/${file.path}`
        ),
        createdBy: new mongoose.Types.ObjectId(`${req.body.createdBy}`),
      });

      res.status(201).json({
        message: 'Product Successfully Saved',
        success: true,
        data: product,
      });
    } catch (err) {
      res.status(400);
      next(err);
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const id = req.params.id;

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id },
        { isArchived: true },
        { new: true }
      );

      if (!updatedProduct) {
        res.status(404);
        throw new Error('Product not found');
      }

      res.status(201).json({
        success: true,
        message: 'Product archived successfully',
        data: updatedProduct,
      });
    } catch (err) {
      res.status(400);
      next(err);
    }
  };

  restoreProduct = async (req, res, next) => {
    try {
      const id = req.params.id;

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id },
        { isArchived: false },
        { new: true }
      );

      if (!updatedProduct) {
        res.status(404);
        throw new Error('Product not found');
      }

      res.status(201).json({
        success: true,
        message: 'Product restored successfully',
        data: updatedProduct,
      });
    } catch (err) {
      res.status(400);
      next(err);
    }
  };
}
