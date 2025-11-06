import Product from '../models/productModel.js';

export default class ProductController {
  getProducts = async (req, res, next) => {
    try {
      const products = await Product.find({ isArchived: false });
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
      console.log(req.files);

      const { name, sku, category, description, price } = req.body;

      const product = await Product.create({
        name,
        sku,
        category,
        description,
        price,
        productImage: req.files.map((f) => f.path),
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
      const { id } = req.params;
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

      res.json({
        success: true,
        message: 'Product archived successfully',
        product: updatedProduct,
      });
    } catch (err) {
      next(err);
    }
  };
}
