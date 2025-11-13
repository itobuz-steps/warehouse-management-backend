import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

export default class AdminController {
  addWarehouse = async (req, res, next) => {
    try {
      let { name, address, description, managers: managerIds } = req.body;

      managerIds = managerIds.map((id) => new mongoose.Types.ObjectId(`${id}`));

      // Create the warehouse document
      const newWarehouse = new Warehouse({
        name,
        address,
        description,
        managerIds,
      });

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
        data: updatedWarehouse,
      });
    } catch (err) {
      next(err);
    }
  };

  removeWarehouse = async (req, res, next) => {
    try {
      const warehouseId = req.params.warehouseId;
      const warehouse = await Warehouse.findOne({ _id: warehouseId });

      if (!warehouse.active) {
        res.status(400);
        throw new Error('Warehouse Already Deleted');
      }

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
        data: updatedWarehouse,
      });
    } catch (err) {
      next(err);
    }
  };

  getManagers = async (req, res, next) => {
    try {
      const managers = await User.find({ role: 'manager', isVerified: true });
      console.log(managers);

      res.status(200).json({
        message: 'All Managers',
        success: true,
        data: managers,
      });
    } catch (err) {
      next(err);
    }
  };
}
