import Quantity from '../models/quantityModel.js';
import Warehouse from '../models/warehouseModel.js';
import Transaction from '../models/transactionModel.js';
import Product from '../models/productModel.js';
import {
  generateTwoProductQuantityExcel,
  generateTwoProductTransactionExcel,
} from '../services/generateExcel.js';
export default class AnalyticsController {
  // for bar chart
  getTwoProductQuantitiesForWarehouse = async (req, res, next) => {
    try {
      const result = await this.getTwoProductQuantitiesForWarehouseData(
        req.query
      );
      console.log(result);

      res.status(200).json({
        success: true,
        message: 'Product quantities fetched successfully for the warehouse.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTwoProductQuantitiesForWarehouseExcel = async (req, res, next) => {
    try {
      const quantities = await this.getTwoProductQuantitiesForWarehouseData(
        req.query
      );

      const result = await generateTwoProductQuantityExcel(quantities);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=top-products.xlsx'
      );

      // Send the file buffer
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  };

  getTwoProductQuantitiesForWarehouseData = async (ids) => {
    console.log(ids);
    const { warehouseId, productA, productB } = ids;

    if (!warehouseId || !productA || !productB) {
      throw new Error('warehouseId, productA, and productB are required.');
    }

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found.');
    }

    const productAData = await Product.findById(productA).lean();
    const productBData = await Product.findById(productB).lean();

    if (!productAData || !productBData) {
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
    return result;
  };

  // for line chart
  getTwoProductComparisonHistoryForWarehouse = async (req, res, next) => {
    try {
      const result = await this.getTwoProductComparisonHistoryForWarehouseData(
        req.query
      );

      res.status(200).json({
        success: true,
        message: 'Transaction comparison history fetched successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getTwoProductComparisonHistoryForWarehouseExcel = async (req, res, next) => {
    try {
      const quantities =
        await this.getTwoProductComparisonHistoryForWarehouseData(req.query);

      const result = await generateTwoProductTransactionExcel(quantities);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=top-products.xlsx'
      );

      // Send the file buffer
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  };

  getTwoProductComparisonHistoryForWarehouseData = async (ids) => {
    const { warehouseId, productA, productB } = ids;

    if (!warehouseId || !productA || !productB) {
      throw new Error('warehouseId, productA, and productB are required.');
    }

    const warehouse = await Warehouse.findById(warehouseId).lean();

    if (!warehouse) {
      throw new Error('Warehouse not found.');
    }

    const productAData = await Product.findById(productA).lean();
    const productBData = await Product.findById(productB).lean();

    if (!productAData || !productBData) {
      throw new Error('One or both product(s) not found.');
    }

    // last 7 days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    // Fetch transactions only for last 7 days
    const transactions = await Transaction.find({
      product: { $in: [productA, productB] },
      createdAt: { $gte: startDate, $lte: endDate },
      $or: [
        { sourceWarehouse: warehouseId },
        { destinationWarehouse: warehouseId },
      ],
    }).lean();

    const counts = { productA: {}, productB: {} };
    const dateList = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dateKey = d.toLocaleDateString('en-CA');
      dateList.push(dateKey);

      counts.productA[dateKey] = 0;
      counts.productB[dateKey] = 0;
    }

    // 🔹 Count transactions (LOCAL DATE)
    for (const transaction of transactions) {
      const dateKey = new Date(transaction.createdAt).toLocaleDateString(
        'en-CA'
      );

      if (String(transaction.product) === String(productA)) {
        counts.productA[dateKey]++;
      }

      if (String(transaction.product) === String(productB)) {
        counts.productB[dateKey]++;
      }
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

    for (const date of dateList) {
      result.productA.history.push({
        date,
        transactions: counts.productA[date],
      });

      result.productB.history.push({
        date,
        transactions: counts.productB[date],
      });
    }

    return result;
  };
}
