import Quantity from '../models/quantityModel.js';
import Warehouse from '../models/warehouseModel.js';
import Transaction from '../models/transactionModel.js';
import Product from '../models/productModel.js';
export default class AnalyticsController {
  //for bar chart
  getTwoProductQuantitiesForWarehouse = async (req, res, next) => {
    try {
      const { warehouseId, productA, productB } = req.query;

      if (!warehouseId || !productA || !productB) {
        res.status(400);
        throw new Error('warehouseId, productA, and productB are required.');
      }

      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        res.status(404);
        throw new Error('Warehouse not found.');
      }

      const productAData = await Product.findById(productA).lean();
      const productBData = await Product.findById(productB).lean();

      if (!productAData || !productBData) {
        res.status(404);
        throw new Error('One or both product(s) not found.');
      }

      const quantityA = await Quantity.findOne({
        warehouseId,
        productId: productA,
      }).lean();

      const quantityB = await Quantity.findOne({
        warehouseId,
        productId: productB,
      }).lean();

      const result = {
        warehouse: warehouse.name,
        productA: {
          id: productA,
          name: productAData.name,
          quantity: quantityA ? quantityA.quantity : 0,
        },
        productB: {
          id: productB,
          name: productBData.name,
          quantity: quantityB ? quantityB.quantity : 0,
        },
      };

      res.status(200).json({
        success: true,
        message: 'Product quantities fetched successfully for the warehouse.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTwoProductComparisonHistoryForWarehouse = async (req, res, next) => {
    try {
      const { warehouseId, productA, productB } = req.query;

      if (!warehouseId || !productA || !productB) {
        res.status(400);
        throw new Error('warehouseId, productA, and productB are required.');
      }

      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        res.status(404);
        throw new Error('Warehouse not found.');
      }

      const productAData = await Product.findById(productA).lean();
      const productBData = await Product.findById(productB).lean();

      if (!productAData || !productBData) {
        res.status(404);
        throw new Error('One or both product(s) not found.');
      }

      const transactions = await Transaction.find({
        product: { $in: [productA, productB] },
        $or: [
          { sourceWarehouse: warehouseId },
          { destinationWarehouse: warehouseId },
        ],
      }).lean();

      if (transactions.length === 0) {
        res.status(404);
        throw new Error('No transaction history found.');
      }

      const counts = { productA: {}, productB: {} };
      let minDate = null;
      let maxDate = null;

      for (const t of transactions) {
        let key = null;

        if (String(t.product) === String(productA)) key = 'productA';
        if (String(t.product) === String(productB)) key = 'productB';

        if (!key) continue;

        const date = new Date(t.createdAt).toISOString().split('T')[0];

        counts[key][date] = (counts[key][date] || 0) + 1;

        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }

      const result = {
        warehouse: warehouse.name,
        productA: {
          id: productA,
          name: productAData.name,
          history: [],
        },
        productB: {
          id: productB,
          name: productBData.name,
          history: [],
        },
      };

      let current = new Date(minDate);
      const end = new Date(maxDate);

      while (current <= end) {
        const date = current.toISOString().split('T')[0];

        result.productA.history.push({
          date,
          transactions: counts.productA[date] || 0,
        });

        result.productB.history.push({
          date,
          transactions: counts.productB[date] || 0,
        });

        current.setDate(current.getDate() + 1);
      }

      return res.status(200).json({
        success: true,
        message: 'Transaction comparison history fetched successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
