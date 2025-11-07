import express from 'express';
import ProductController from '../controllers/ProductController.js';
import ProductValidation from '../validations/middlewares/ProductValidation.js';
import multer from 'multer';
import path from 'path';

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

const upload = multer({ storage, limits: { fileSize: 0.5 * 1024 * 1024 } });

router.post(
  '/',
  upload.array('productImage', 8),
  productValidation.createProductValidation,
  productController.createProduct
);

router.post('/product-quantity', productController.addProductQuantity);

router.get('/', productController.getProducts);

// getting total quantity of a product across all warehouse
router.get(
  '/product-quantity/:productId',
  productController.getProductQuantityAcrossAllWarehouse
);

router.get(
  '/product-quantity?warehouseId=:warehouseId&productId=:productId',
  productController.getProductQuantityAcrossAllWarehouse
);

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
