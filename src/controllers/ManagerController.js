import Warehouse from '../models/warehouseModel.js';
import User from '../models/userModel.js';

export default class ManagerController {
  getWarehousesByManager = async (req, res) => {
    try {
      const { managerId } = req.params;

      // Validate if the manager exists
      const manager = await User.findById(managerId);

      if (!manager) {
        return res.status(404).json({ message: 'Manager not found' });
      }

      if (manager.role !== 'manager') {
        return res.status(400).json({ message: 'User is not a manager' });
      }

      // Find warehouses where this manager is assigned
      const warehouses = await Warehouse.find({
        managerIds: managerId,
      }).populate({
        path: 'managerIds',
        select: 'name email role',
      });

      res.status(200).json({
        manager: {
          id: manager._id,
          name: manager.name,
          email: manager.email,
        },
        assignedWarehouses: warehouses,
      });
    } catch (error) {
      console.error('Error fetching manager warehouses:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
}
