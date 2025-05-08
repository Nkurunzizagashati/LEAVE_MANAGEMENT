import express from 'express';
import { checkSchema } from 'express-validator';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import {
  createLeaveType,
  getLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType
} from '../controllers/leaveTypeController.js';
import { createLeaveTypeValidator, updateLeaveTypeValidator } from '../middlewares/leaveType.js';

const router = express.Router();

// Admin only routes
router.post('/', verifyToken, checkRole(['ADMIN']), checkSchema(createLeaveTypeValidator), createLeaveType);
router.put('/:id', verifyToken, checkRole(['ADMIN']), checkSchema(updateLeaveTypeValidator), updateLeaveType);
router.delete('/:id', verifyToken, checkRole(['ADMIN']), deleteLeaveType);

// Public routes
router.get('/', verifyToken, getLeaveTypes);
router.get('/:id', verifyToken, getLeaveTypeById);

export default router; 