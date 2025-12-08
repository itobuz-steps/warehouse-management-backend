import Quantity from '../models/quantityModel.js';
//import Transaction from '../models/transactionModel.js';

export default class AnalyticsController {
  //for bar chart
  getWarehouseWiseProductQuantity = async (req, res, next) => {
    try {
      const { productId } = req.params;

      // Fetch quantities for this product across warehouses
      const quantities = await Quantity.find({ productId })
        .populate('warehouseId', 'name address')
        .lean();

      if (!quantities.length) {
        res.status(404);
        res.json({ success: false });
        throw new Error('No quantity records found for this product.');
      }

      const data = quantities.map((q) => ({
        warehouse: q.warehouseId.name,
        quantity: q.quantity,
      }));

      res.status(200).json({
        success: true,
        message: 'Warehouse-wise quantity fetched successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
