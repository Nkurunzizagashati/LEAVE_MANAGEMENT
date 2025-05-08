import express from 'express';
import leaveTypeRoutes from './leaveTypeRoutes.js';
import leaveRequestRoutes from './leaveRequestRoutes.js';
import leaveBalanceRoutes from './leaveBalanceRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import userRoutes from './userRoutes.js';
import teamRoutes from './teamRoutes.js';
import departmentRoutes from './departmentRoutes.js';

const router = express.Router();

router.use('/types', leaveTypeRoutes);
router.use('/requests', leaveRequestRoutes);
router.use('/balances', leaveBalanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/departments', departmentRoutes);

export default router;
