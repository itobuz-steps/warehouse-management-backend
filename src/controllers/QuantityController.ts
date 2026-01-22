import mongoose from 'mongoose';
import Quantity from '../models/quantityModel.js';
import { AsyncController } from '../types/express.js';

type AddProductQuantityBody = {
  productId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  quantity: number;
  limit: number;
};

type UpdateProductLimitParams = {
  id: string;
};

type UpdateProductLimitBody = {
  limit: number;
};

type ProductIdParams = {
  productId: mongoose.Types.ObjectId;
};

type WarehouseIdParams = {
  warehouseId: mongoose.Types.ObjectId;
};

type ProductWarehouseQuery = {
  productId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
};

type ProductsHavingQuantityQuery = {
  search?: string;
  category?: string;
  sort?:
    | 'name_asc'
    | 'name_desc'
    | 'category_asc'
    | 'quantity_asc'
    | 'quantity_desc';
  warehouseId?: string;
  page?: string;
  limit?: string;
};

export default class QuantityController {
  // adding a product in a specific warehouse
  addProductQuantity: AsyncController<
    Record<string, never>,
    AddProductQuantityBody
  > = async (req, res, next): Promise<void> => {
    try {
      const { productId, warehouseId, quantity, limit } = req.body;

      const createdQuantity = await Quantity.create({
        productId,
        warehouseId,
        quantity,
        limit,
      });

      const result = await Quantity.findById({
        _id: createdQuantity._id,
      }).populate('warehouseId productId');

      res.status(200).json({
        message: 'Product Quantity Updated',
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateProductLimit: AsyncController<
    UpdateProductLimitParams,
    UpdateProductLimitBody
  > = async (req, res, next): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit } = req.body;

      const result = await Quantity.findByIdAndUpdate(
        id,
        { limit },
        { new: true }
      ).populate('warehouseId productId');

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Quantity record not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product limit updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  // getting total quantity of a product across all warehouse
  getTotalProductQuantity: AsyncController<ProductIdParams> = async (
    req,
    res,
    next
  ): Promise<void> => {
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
  getProductQuantityAcrossSpecificWarehouse: AsyncController<
    Record<string, never>,
    never,
    ProductWarehouseQuery
  > = async (req, res, next): Promise<void> => {
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
  getWarehouseSpecificProducts: AsyncController<WarehouseIdParams> = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      const result = await Quantity.aggregate([
        {
          $match: {
            warehouseId: new mongoose.Types.ObjectId(
              `${req.params.warehouseId}`
            ),
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
  getProductSpecificWarehouses: AsyncController<ProductIdParams> = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      const result = await Quantity.find({ productId: req.params.productId })
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

  getProductsHavingQuantity: AsyncController<
    Record<string, never>,
    never,
    ProductsHavingQuantityQuery
  > = async (req, res, next): Promise<void> => {
    try {
      const {
        search,
        category,
        sort,
        warehouseId,
        page = '1',
        limit = '10',
      } = req.query;

      const pipeline: any[] = [];

      // Filter by warehouse if provided
      if (warehouseId) {
        pipeline.push({
          $match: {
            warehouseId: new mongoose.Types.ObjectId(`${warehouseId}`),
          },
        });
      }

      // Join products
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

        // Exclude archived products
        { $match: { 'product.isArchived': false } }
      );

      // Search
      if (search) {
        pipeline.push({
          $match: {
            'product.name': { $regex: search, $options: 'i' },
          },
        });
      }

      // Category filter
      if (category) {
        pipeline.push({
          $match: {
            'product.category': category,
          },
        });
      }

      // group
      pipeline.push({
        $group: {
          _id: '$productId',
          product: { $first: '$product' },
          totalQuantity: { $sum: '$quantity' },
        },
      });

      // Sorting
      if (sort === 'name_asc') {
        pipeline.push({ $sort: { 'product.name': 1 } });
      } else if (sort === 'name_desc') {
        pipeline.push({ $sort: { 'product.name': -1 } });
      } else if (sort === 'category_asc') {
        pipeline.push({ $sort: { 'product.category': 1 } });
      } else if (sort === 'quantity_asc') {
        pipeline.push({ $sort: { totalQuantity: 1 } });
      } else if (sort === 'quantity_desc') {
        pipeline.push({ $sort: { totalQuantity: -1 } });
      } else {
        pipeline.push({ $sort: { 'product.createdAt': -1 } });
      }

      // const totalCount = (await Quantity.aggregate(pipeline)).length;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

      // Replace root to merge product info
      pipeline.push({
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$product', { totalQuantity: '$totalQuantity' }],
          },
        },
      });

      const products = await Quantity.aggregate(pipeline);

      const countPipeline = pipeline.slice(0, -3); // remove $skip, $limit, $replaceRoot
      countPipeline.push({ $count: 'count' });
      const countResult = await Quantity.aggregate(countPipeline);
      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        message: 'Products with quantity information',
        success: true,
        data: {
          products,
          totalCount,
          totalPages,
          currentPage: parseInt(page),
          productsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
