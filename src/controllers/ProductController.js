import Product from '../models/productModel.js';

export default class ProductController {
    
  getProducts = async (req, res, next) => {
    try {
      const products = await Product.find();
      res.json(products);
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
        throw new Error('Product not found');
      }
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const newProduct = await Product.create({
        ...req.body,
      });
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  };
}
