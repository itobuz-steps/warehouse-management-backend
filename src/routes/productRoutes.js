import express from 'express';
import ProductController from '../controllers/ProductController.js';
import ProductValidation from '../validations/middlewares/ProductValidation.js';

const productController = new ProductController();
const productValidation = new ProductValidation();

const router = express.Router();
router.post(
  '/',
  productValidation.createProductValidation,
  productController.createProduct
);

export default router;
