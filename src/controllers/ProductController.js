import Product from '../models/productModel.js';
import mongoose from 'mongoose';
import Quantity from '../models/quantityModel.js';

export default class ProductController {
  getProducts = async (req, res, next) => {
    try {
      const products = await Product.find({ isArchived: false }).populate(
        'createdBy'
      );

      res
        .status(200)
        .json({ message: 'All Products', success: true, data: products });
    } catch (error) {
      res.status(400);
      next(error);
    }
  };

  searchProducts = async (req, res, next) => {
    try {
      const { search, category, sort, warehouseId } = req.query;

      let productIds = [];
      if (warehouseId) {
        const quantities = await Quantity.find({ warehouseId });
        productIds = quantities.map((q) => q.productId);
      }

      let productsQuery = Product.find({
        isArchived: false,
        ...(productIds.length > 0 && { _id: { $in: productIds } }),
        ...(category && { category }),
        ...(search && { name: { $regex: search, $options: 'i' } }),
      });

      // Sort by name or category
      const sortOption = {};
      if (sort === 'name_asc') sortOption.name = 1;
      if (sort === 'name_desc') sortOption.name = -1;
      if (sort === 'category_asc') sortOption.category = 1;

      // Quantity sorting requires aggregation
      if (sort === 'quantity_asc' || sort === 'quantity_desc') {
        const pipeline = [
          ...(warehouseId
            ? [
                {
                  $match: {
                    warehouseId: new mongoose.Types.ObjectId(warehouseId),
                  },
                },
              ]
            : []),
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: '$product' },
          ...(search
            ? [
                {
                  $match: { 'product.name': { $regex: search, $options: 'i' } },
                },
              ]
            : []),
          ...(category ? [{ $match: { 'product.category': category } }] : []),
          { $sort: { quantity: sort === 'quantity_asc' ? 1 : -1 } },
        ];

        const result = await Quantity.aggregate(pipeline);
        return res.status(200).json({ success: true, data: result });
      }

      // Apply sorting if name/category
      if (Object.keys(sortOption).length > 0) {
        productsQuery = productsQuery.sort(sortOption);
      }

      const products = await productsQuery.exec();
      res.status(200).json({ success: true, data: products });
    } catch (err) {
      next(err);
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
