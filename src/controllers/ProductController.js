import Product from '../models/productModel.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Warehouse from '../models/warehouseModel.js';
import Quantity from '../models/quantityModel.js';
import USER_TYPES from '../constants/userConstants.js';

export default class ProductController {
  getProducts = async (req, res, next) => {
    try {
      const { search, category, sort } = req.query;

      const userId = req.userId;
      const user = await User.findById({ _id: userId });

      const filter = { isArchived: false };

      if (user.role === USER_TYPES.MANAGER) {
        const warehouses = await Warehouse.find({
          managerIds: userId,
          active: true,
        });

        if (!warehouses) {
          return res.json({ products: [], totalProducts: 0 });
        }

        // get warehouse IDs array
        const warehouseIds = warehouses.map(function (w) {
          return w._id;
        });

        // get all quantities for those warehouses
        const quantities = await Quantity.find({
          warehouseId: { $in: warehouseIds },
        });

        // collect productIds without duplicates
        let uniqueProductIds = [];
        for (let i = 0; i < quantities.length; i++) {
          const productId = quantities[i].productId.toString();
          if (!uniqueProductIds.includes(productId)) {
            uniqueProductIds.push(productId);
          }
        }

        // filter products by these IDs
        filter._id = uniqueProductIds;
      }

      if (category) {
        filter.category = category;
      }

      if (search) {
        filter.name = { $regex: search, $options: 'i' };
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
      const updates = {};

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
