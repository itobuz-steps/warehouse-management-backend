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

  updateWarehouse = async (req, res, next) => {
    try {
      const warehouseId = req.params.warehouseId;

      const updatedWarehouse = await Warehouse.findByIdAndUpdate(
        warehouseId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedWarehouse) {
        res.status(404);

        throw new Error('No warehouse found');
      }

      res.status(200).json({
        success: true,
        message: 'Warehouse successfully Updated',
        warehouse: updatedWarehouse,
      });
    } catch (err) {
      next(err);
    }
  };

  removeWarehouse = async (req, res, next) => {
    try {
      const warehouseId = req.params.warehouseId;

      const updatedWarehouse = await Warehouse.findByIdAndUpdate(
        warehouseId,
        {
          active: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedWarehouse) {
        res.status(404);

        throw new Error('No warehouse found');
      }

      res.status(200).json({
        success: true,
        message: 'Warehouse successfully Removed',
        warehouse: updatedWarehouse,
      });
    } catch (err) {
      next(err);
    }
  };

  restoreWarehouse = async (req, res, next) => {
    try {
      const warehouseId = req.params.warehouseId;

      const updatedWarehouse = await Warehouse.findByIdAndUpdate(
        warehouseId,
        {
          active: true,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedWarehouse) {
        res.status(404);

        throw new Error('No warehouse found');
      }

      res.status(200).json({
        success: true,
        message: 'Warehouse successfully Restored',
        warehouse: updatedWarehouse,
      });
    } catch (err) {
      next(err);
    }
  };
}
