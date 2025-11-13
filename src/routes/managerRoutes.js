import ManagerController from '../controllers/ManagerController.js';
import express from 'express';

const router = express.Router();
const managerController = new ManagerController();

router.get('/:managerId', managerController.getWarehousesByManager);

export default router;
