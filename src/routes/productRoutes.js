import express from 'express';
import ProductController from '../controllers/ProductController.js';
import ProductValidation from '../validations/middlewares/ProductValidation.js';
import multer from 'multer';
import path from 'path';

const productController = new ProductController();
const productValidation = new ProductValidation();

const storage = multer.diskStorage({
  destination: 'uploads/product',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage, limits: { fileSize: 0.5 * 1024 * 1024 } });

const router = express.Router();
router.post(
  '/',
  upload.array('product-img', 8),
  productValidation.createProductValidation,
  productController.createProduct
);
router.get('/', productController.getProducts);
router.patch(
  '/:id',
  productValidation.updateProductValidation,
  productController.updateProduct
);
router.delete(
  '/:id',
  productValidation.deleteProductValidation,
  productController.deleteProduct
);

export default router;
