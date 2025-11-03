import Product from '../models/productModel.js';

export default class ProductController {
  createProduct = async (req, res, next) => {
    try {
      const newProduct = await Product.create({
        ...req.body,
      });
      const productImage = req.file ? req.file.filename : null;
      
      if (productImage) {
        newProduct.product_img = productImage;
      }

      await newProduct.save();

      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  };
}
