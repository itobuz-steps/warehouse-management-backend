import Warehouse from '../models/warehouseModel.js';

export default class AdminController {
  addWarehouse = async (req, res, next) => {
    try {
      const newWarehouse = new Warehouse(req.body);

      newWarehouse.save();

      res.status(200).json({
        success: true,
        message: 'Warehouse successfully added',
      });
    } catch (err) {
      next(err);
    }
  };
}
