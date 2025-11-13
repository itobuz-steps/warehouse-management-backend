import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';

export default class ManagerController {
  getWarehousesByManager = async (req, res, next) => {
    try {
      const { managerId } = req.params;

      // Validate if the manager exists
      const manager = await User.findById(managerId);

      if (!manager) {
        res.status(404);
        throw new Error('Manager not found');
      }

      if (manager.role !== 'manager') {
        res.status(400);
        throw new Error('User is not Manager');
      }

      // Find warehouses where this manager is assigned
      const warehouses = await Warehouse.find({
        managerIds: managerId,
      }).populate({
        path: 'managerIds',
        select: 'name email role',
      });

      return res.status(200).json({
        success: true,
        data: {
          manager: {
            id: manager._id,
            name: manager.name,
            email: manager.email,
          },
          assignedWarehouses: warehouses,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
