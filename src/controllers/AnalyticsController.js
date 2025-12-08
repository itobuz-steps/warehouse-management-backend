import Quantity from '../models/quantityModel.js';
import Warehouse from '../models/warehouseModel.js';
// import Transaction from '../models/transactionModel.js';

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
}
