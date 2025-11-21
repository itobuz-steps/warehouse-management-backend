import express from 'express';
import QuantityController from '../controllers/QuantityController.js';

const router = express.Router();
const quantityController = new QuantityController();

router.post('/product-quantity', quantityController.addProductQuantity);

// getting total quantity of a product across all warehouse
router.get(
  '/product-total-quantity/:productId',
  quantityController.getTotalProductQuantity
);

// getting quantity of a specific product in a specific warehouse
router.get(
  '/specific-product-quantity',
  quantityController.getProductQuantityAcrossSpecificWarehouse
);

router.get(
  '/all-products-quantity',
  quantityController.getProductsHavingQuantity
);

router.get(
  '/warehouse-specific-products/:warehouseId',
  quantityController.getWarehouseSpecificProducts
);

router.get(
  '/product-specific-warehouses/:productId',
  quantityController.getProductSpecificWarehouses
);

export default router;
