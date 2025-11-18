import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';

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

      if (user.role === 'manager') {
        // Get only warehouses assigned to this manager
        warehouses = await Warehouse.find({ managerIds: user._id, active: true }).populate({
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

      if (user.role === 'admin') {
        // Get all warehouses
        warehouses = await Warehouse.find({active: true}).populate({
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

      if (user.role === 'manager') {
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

      if (user.role === 'admin') {
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
}
