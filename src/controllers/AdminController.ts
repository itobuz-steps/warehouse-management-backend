import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import USER_TYPES from '../constants/userConstants.js';
import type { AppRequest, AppResponse, AppNext } from '../types/express.js';

type AddWarehouseBody = {
  name: string;
  address: string;
  description?: string;
  managers?: string[];
  capacity: number;
};

type UpdateWarehouseBody = {
  name?: string;
  address?: string;
  description?: string;
  managers?: string[];
};

export default class AdminController {
  addWarehouse = async (
    req: AppRequest<{}, AddWarehouseBody>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const { name, address, description, managers, capacity } = req.body;

      const managerIds = managers?.map(
        (id) => new mongoose.Types.ObjectId(`${id}`)
      );

      // Create the warehouse document
      const newWarehouse = new Warehouse({
        name,
        address,
        description,
        managerIds,
        capacity,
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

  updateWarehouse = async (
    req: AppRequest<{ warehouseId: string }, UpdateWarehouseBody>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const { name, address, description, managers } = req.body;

      const managerIdsArray = managers?.map(
        (id) => new mongoose.Types.ObjectId(`${id}`)
      );
      const updatedWarehouse = await Warehouse.findByIdAndUpdate(
        req.params.warehouseId,
        {
          name,
          address,
          description,
          managerIds: managerIdsArray,
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
        message: 'Warehouse successfully Updated',
        data: updatedWarehouse,
      });
    } catch (err) {
      next(err);
    }
  };

  removeWarehouse = async (
    req: AppRequest<{ warehouseId: string }>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const warehouse = await Warehouse.findOneAndUpdate(
        { _id: req.params.warehouseId, active: true },
        { active: false },
        { new: true, runValidators: true }
      );

      if (!warehouse) {
        res.status(400);
        throw new Error('Warehouse Already Deleted or Not Found');
      }

      res.status(200).json({
        success: true,
        message: 'Warehouse successfully removed',
      });
    } catch (err) {
      next(err);
    }
  };

  getManagers = async (
    req: AppRequest,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const managers = await User.find({
        role: USER_TYPES.MANAGER,
        isVerified: true,
      });

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
