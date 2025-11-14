import express from 'express';
import ProductController from '../controllers/ProductController.js';
import ProductValidation from '../validations/middlewares/ProductValidation.js';
import multer from 'multer';
import path from 'path';
import config from '../config/config.js';

const router = express.Router();
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

const upload = multer({
  storage,
  limits: { fileSize: config.UPLOAD_FILE_SIZE },
});

router.post(
  '/',
  upload.array('productImage', 8),
  productValidation.createProductValidation,
  productController.createProduct
);

router.get('/', productController.getProducts);

router.put(
  '/:id',
  upload.array('productImage', 8),
  productValidation.updateProductValidation,
  productController.updateProduct
);

router.delete(
  '/:id',
  productValidation.deleteProductValidation,
  productController.deleteProduct
);

router.patch(
  '/:id',
  productValidation.restoreProductValidation,
  productController.restoreProduct
);

router.get('/search', productController.searchProducts);

export default router;
