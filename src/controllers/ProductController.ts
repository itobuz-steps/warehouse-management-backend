import Product from '../models/productModel.js';
import mongoose from 'mongoose';
import generateQrCode from '../services/generateQr.js';
import config from '../config/config.js';
import type { AsyncController } from '../types/express.js';

type ProductParams = {
  id: string;
};

type GetProductsQuery = {
  search?: string;
  category?: string;
  sort?: 'name_asc' | 'name_desc' | 'category_asc' | 'latest';
  page?: string;
  limit?: string;
};

type UpdateProductBody = {
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  markup?: number;
};

type CreateProductBody = {
  name: string;
  category: string;
  description?: string;
  price: number;
  markup?: number;
  createdBy: string;
};

type CreateProductParams = Record<string, never>;

type GetArchivedProductsQuery = {
  search?: string;
  category?: string;
  sort?: 'name_asc' | 'name_desc' | 'category_asc' | 'latest';
  page?: string;
  limit?: string;
};

export default class ProductController {
  getProducts: AsyncController<{}, {}, GetProductsQuery> = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      const { search, category, sort, page = '1', limit = '10' } = req.query;
      const filter: Record<string, any> = { isArchived: false };

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
        } else {
          query = query.sort({ createdAt: -1 }); // default sort newest first
        }
      }
      // Calculate skip and limit for pagination
      const pageNumber = Math.max(parseInt(page, 10), 1);
      const limitNumber = Math.max(parseInt(limit, 10), 1);
      const skip = (pageNumber - 1) * limitNumber;
      const products = await query.skip(skip).limit(limitNumber);

      // Get the total count of products for pagination info
      const totalCount = await Product.countDocuments(filter);

      const totalPages = Math.ceil(totalCount / limitNumber);

      res.status(200).json({
        success: true,
        data: {
          products,
          totalCount,
          totalPages,
          currentPage: pageNumber,
          productsPerPage: limitNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProduct: AsyncController<ProductParams, UpdateProductBody> = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const updates: UpdateProductBody & { productImage?: string[] } = {};
      const { name, category, description, price, markup } = req.body;

      if (name !== undefined) updates.name = name;
      if (category !== undefined) updates.category = category;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (markup !== undefined) updates.markup = markup;

      // for (const [key, value] of Object.entries(req.body)) {
      //   if (value) {
      //     updates[key] = value;
      //   }
      // }

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
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

  createProduct: AsyncController<CreateProductParams, CreateProductBody> =
    async (req, res, next): Promise<void> => {
      try {
        const { name, category, description, price, markup, createdBy } =
          req.body;
        const productImages: string[] = [];

        if (req.files && Array.isArray(req.files)) {
          for (const file of req.files) {
            productImages.push(
              `${req.protocol}://${req.get('host')}/${file.path}`
            );
          }
        }

        const product = await Product.create({
          name,
          category,
          description,
          price,
          markup,
          productImage: productImages,
          createdBy: new mongoose.Types.ObjectId(createdBy),
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

  deleteProduct: AsyncController<ProductParams> = async (
    req,
    res,
    next
  ): Promise<void> => {
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
      });
    } catch (err) {
      next(err);
    }
  };

  restoreProduct: AsyncController<ProductParams> = async (
    req,
    res,
    next
  ): Promise<void> => {
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

  getProductQrCode: AsyncController<ProductParams> = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      const productId = req.params.id;

      const qr = await generateQrCode(
        `${req.protocol}://${config.FRONTEND_URL}/pages/qr-product.html?id=${productId}`
      );
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');

      res.status(200).send(qr);
    } catch (err) {
      next(err);
    }
  };

  getProductById: AsyncController<ProductParams> = async (
    req,
    res,
    next
  ): Promise<void> => {
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

  getArchivedProducts: AsyncController<
    Record<string, never>,
    never,
    GetArchivedProductsQuery
  > = async (req, res, next) => {
    try {
      const { search, category, sort, page = '1', limit = '10' } = req.query;

      const filter: Record<string, unknown> = { isArchived: true };

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
        } else {
          query = query.sort({ createdAt: -1 }); // default sort newest first
        }
      }

      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const skip = (pageNumber - 1) * limitNumber;
      // Calculate skip and limit for pagination
      const products = await query.skip(skip).limit(limitNumber);

      // Get the total count of products for pagination info
      const totalCount = await Product.countDocuments(filter);

      const totalPages = Math.ceil(totalCount / limitNumber);

      res.status(200).json({
        success: true,
        data: {
          products,
          totalCount,
          totalPages,
          currentPage: pageNumber,
          productsPerPage: limitNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
