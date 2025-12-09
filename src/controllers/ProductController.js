import Product from '../models/productModel.js';
import Quantity from '../models/quantityModel.js';
import mongoose from 'mongoose';
import generateQrCode from '../services/generateQr.js';
import config from '../config/config.js';
export default class ProductController {
  getProducts = async (req, res, next) => {
    try {
      const { search, category, sort } = req.query;
      const filter = { isArchived: false };

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

      await Quantity.deleteMany({ productId: id });

      res.status(201).json({
        success: true,
        message:
          'Product archived and removed from all warehouses successfully',
      });
    } catch (err) {
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
      });
    } catch (err) {
      next(err);
    }
  };

  getProductQrCode = async (req, res, next) => {
    try {
      const productId = req.params.id;

      const qr = await generateQrCode(
        `${req.protocol}://${config.FRONTEND_URL}/pages/product.html?id=${productId}`
      );
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');

      res.status(200).send(qr);
    } catch (err) {
      next(err);
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      res.status(201).json({
        message: 'Product with specific id',
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  };
}
