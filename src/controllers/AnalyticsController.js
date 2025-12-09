import Quantity from '../models/quantityModel.js';
import Warehouse from '../models/warehouseModel.js';
import Transaction from '../models/transactionModel.js';

export default class AnalyticsController {
  //for bar chart
  getTwoProductQuantitiesForWarehouse = async (req, res, next) => {
    try {
      const { warehouseId, productA, productB } = req.query;

      // Validate required parameters
      if (!warehouseId || !productA || !productB) {
        res.status(400);
        res.json({ success: false });
        throw new Error('warehouseId, productA, and productB are required.');
      }

      // Validate warehouse existence
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        res.status(404);
        res.json({ success: false });
        throw new Error('Warehouse not found.');
      }

      // Fetch quantities for product A
      const quantityA = await Quantity.findOne({
        warehouseId,
        productId: productA,
      }).lean();

      // Fetch quantities for product B
      const quantityB = await Quantity.findOne({
        warehouseId,
        productId: productB,
      }).lean();

      // If both are missing
      if (!quantityA && !quantityB) {
        res.status(404);
        res.json({ success: false });
        throw new Error(
          'No quantity records found for both products in this warehouse.'
        );
      }

      // Prepare response with defaults
      const result = {
        warehouse: warehouse.name,
        productA: quantityA ? quantityA.quantity : 0,
        productB: quantityB ? quantityB.quantity : 0,
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
        return res.status(400).json({
          success: false,
          message: 'warehouseId, productA, and productB are required.',
        });
      }

      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.',
        });
      }

      const transactions = await Transaction.find({
        product: { $in: [productA, productB] },
        $or: [
          { sourceWarehouse: warehouseId },
          { destinationWarehouse: warehouseId },
        ],
      }).lean();

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No transaction history found.',
        });
      }

      const counts = { productA: {}, productB: {} };
      let minDate = null;
      let maxDate = null;

      // Count transactions per day
      for (const t of transactions) {
        let key = null;

        if (String(t.product) === String(productA)) {
          key = 'productA';
        } else {
          if (String(t.product) === String(productB)) {
            key = 'productB';
          }
        }

        if (key === null) {
          continue;
        }

        const date = new Date(t.createdAt).toISOString().split('T')[0];

        if (!counts[key][date]) {
          counts[key][date] = 0;
        }

        counts[key][date] += 1;

        if (minDate === null || date < minDate) {
          minDate = date;
        }

        if (maxDate === null || date > maxDate) {
          maxDate = date;
        }
      }

      // Fill gaps
      const result = {
        warehouse: warehouse.name,
        productA: [],
        productB: [],
      };

      let current = new Date(minDate);
      const end = new Date(maxDate);

      while (current <= end) {
        const date = current.toISOString().split('T')[0];

        let a = 0;
        if (counts.productA[date]) {
          a = counts.productA[date];
        }

        let b = 0;
        if (counts.productB[date]) {
          b = counts.productB[date];
        }

        result.productA.push({ date: date, transactions: a });
        result.productB.push({ date: date, transactions: b });

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
