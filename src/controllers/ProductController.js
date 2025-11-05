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
      const productData = JSON.parse(req.body.data);

      const newProduct = await Product.create({
        ...productData,
      });

      const productImages = req.files
        ? req.files.map((file) => file.filename)
        : [];

      if (productImages.length > 0) {
        newProduct.productImage = productImages;
      }

      await newProduct.save();

      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
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
