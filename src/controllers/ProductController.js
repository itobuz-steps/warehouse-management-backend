import Product from '../models/productModel.js';

export default class ProductController {
  createProduct = async (req, res, next) => {
    try {
      const {
        name,
        sku,
        category,
        description,
        product_img,
        price,
        quantity,
        min_stock_level,
        warehouse_id,
        location_id,
        is_archived,
        created_by,
      } = req.body;

      if (
        !name ||
        !sku ||
        !price ||
        !warehouse_id ||
        !location_id ||
        !created_by
      ) {
        res.status(400);
        throw new Error('Fill out the required fields. ');
      }
      const newProduct = await Product.create({
        name,
        sku,
        category,
        description,
        product_img,
        price,
        quantity,
        min_stock_level,
        warehouse_id,
        location_id,
        is_archived,
        created_by,
      });
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  };
}
