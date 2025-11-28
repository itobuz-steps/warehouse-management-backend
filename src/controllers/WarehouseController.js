import mongoose from 'mongoose';
import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';
import Quantity from '../models/quantityModel.js';
import USER_TYPES from '../constants/userConstants.js';

export default class WarehouseController {
  getWarehouses = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId.trim());

      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      let warehouses;

      if (user.role === USER_TYPES.MANAGER) {
        // Get only warehouses assigned to this manager
        warehouses = await Warehouse.find({
          managerIds: user._id,
          active: true,
        }).populate({
          path: 'managerIds',
          select: 'name email role',
        });

        return res.status(200).json({
          success: true,
          data: warehouses,
          // {
          //   manager: {
          //     id: user._id,
          //     name: user.name,
          //     email: user.email,
          //   },
          //   assignedWarehouses: warehouses,
          // },
        });
      }

      if (user.role === USER_TYPES.ADMIN) {
        // Get all warehouses
        warehouses = await Warehouse.find({ active: true }).populate({
          path: 'managerIds',
          select: 'name email role',
        });

        return res.status(200).json({
          message: 'All Warehouses',
          success: true,
          data: warehouses,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  getWarehouseById = async (req, res, next) => {
    try {
      const { userId, warehouseId } = req.params;

      const user = await User.findById(userId.trim());
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      let warehouse;

      if (user.role === USER_TYPES.MANAGER) {
        warehouse = await Warehouse.findOne({
          _id: warehouseId.trim(),
          managerIds: user._id,
        }).populate({
          path: 'managerIds',
          select: 'name email role',
        });

        if (!warehouse) {
          res.status(404);
          throw new Error(
            'Warehouse not found or not assigned to this manager'
          );
        }

        return res.status(200).json({
          success: true,
          data: {
            manager: {
              id: user._id,
              name: user.name,
              email: user.email,
            },
            warehouse,
          },
        });
      }

      if (user.role === USER_TYPES.ADMIN) {
        warehouse = await Warehouse.findById(warehouseId.trim()).populate({
          path: 'managerIds',
          select: 'name email role',
        });

        if (!warehouse) {
          res.status(404);
          throw new Error('Warehouse not found');
        }

        return res.status(200).json({
          message: 'Warehouse Details',
          success: true,
          data: warehouse,
        });
      }

      res.status(403);
      throw new Error('User role not allowed to fetch warehouses');
    } catch (error) {
      next(error);
    }
  };

  getWarehouseCapacity = async (req, res, next) => {
    try {
      const { userId, warehouseId } = req.params;

      const user = await User.findById(userId.trim());
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      let warehouse;

      if (user.role === USER_TYPES.MANAGER) {
        warehouse = await Warehouse.findOne({
          _id: warehouseId.trim(),
          managerIds: user._id,
        });

        if (!warehouse) {
          res.status(404);
          throw new Error(
            'Warehouse not found or not assigned to this manager'
          );
        }
      } else if (user.role === USER_TYPES.ADMIN) {
        warehouse = await Warehouse.findById(warehouseId.trim());

        if (!warehouse) {
          res.status(404);
          throw new Error('Warehouse not found');
        }
      } else {
        res.status(403);
        throw new Error('User role not allowed to fetch warehouse capacity');
      }

      // Aggregate total quantity

      const totalAgg = await Quantity.aggregate([
        {
          $match: {
            warehouseId: new mongoose.Types.ObjectId(warehouse._id),
          },
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
          },
        },
      ]);

      let totalQuantity = 0;
      if (totalAgg.length > 0) {
        totalQuantity = totalAgg[0].totalQuantity;
      }

      // Calculate percentage

      const capacity = warehouse.capacity || 0;
      let percentage = null;

      if (capacity > 0) {
        percentage = (totalQuantity / capacity) * 100;
        percentage = Number(percentage.toFixed(2));
      }

      return res.status(200).json({
        success: true,
        data: {
          warehouse: {
            id: warehouse._id,
            name: warehouse.name,
            capacity: capacity,
          },
          totalQuantity: totalQuantity,
          percentage: percentage,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
