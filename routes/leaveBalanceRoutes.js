import express from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import {
  getLeaveBalance,
  updateLeaveBalance,
  processMonthlyAccrual,
  processYearEndCarryover,
  getAllLeaveBalances
} from '../controllers/leaveBalanceController.js';

const router = express.Router();

// Staff routes
router.get('/my-balance', verifyToken, checkRole(['USER', 'ADMIN', 'MANAGER', 'PENDING']), getLeaveBalance);
router.get('/all', verifyToken, checkRole(['USER', 'ADMIN', 'MANAGER', 'PENDING']), getAllLeaveBalances);

// Admin routes
router.post('/update', verifyToken, checkRole(['ADMIN']), updateLeaveBalance);
router.post('/process-accrual', verifyToken, checkRole(['ADMIN']), processMonthlyAccrual);
router.post('/process-carryover', verifyToken, checkRole(['ADMIN']), processYearEndCarryover);

export default router; 