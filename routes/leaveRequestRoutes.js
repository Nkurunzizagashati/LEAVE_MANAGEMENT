import express from 'express';
import { checkSchema } from 'express-validator';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  updateLeaveRequestStatus,
  getPendingLeaveRequests
} from '../controllers/leaveRequestController.js';
import { createLeaveRequestValidation, updateLeaveRequestStatusValidation } from '../validators/leaveRequestValidator.js';

const router = express.Router();

// Staff routes
router.post('/', 
  verifyToken, 
  checkRole(['USER', 'ADMIN', 'MANAGER', 'PENDING']), 
  upload.array('documents', 5),
  checkSchema(createLeaveRequestValidation),
  createLeaveRequest
);

router.get('/my-requests', 
  verifyToken, 
  checkRole(['USER', 'ADMIN', 'MANAGER', 'PENDING']), 
  getLeaveRequests
);

// 👇 Move this ABOVE `/:id`
router.get('/pending', 
  verifyToken, 
  checkRole(['MANAGER', 'ADMIN']), 
  getPendingLeaveRequests
);

router.get('/:id', 
  verifyToken, 
  checkRole(['USER', 'ADMIN', 'MANAGER', 'PENDING']), 
  getLeaveRequestById
);

// Manager routes
router.put('/:id/status', 
  verifyToken, 
  checkRole(['MANAGER', 'ADMIN']), 
  checkSchema(updateLeaveRequestStatusValidation),
  updateLeaveRequestStatus
);

// Admin routes
router.get('/', verifyToken, checkRole(['ADMIN']), getLeaveRequests);

router.put('/:id', 
  verifyToken, 
  checkRole(['ADMIN']), 
  checkSchema(updateLeaveRequestStatusValidation),
  updateLeaveRequest
);

router.delete('/:id', 
  verifyToken, 
  checkRole(['ADMIN']), 
  deleteLeaveRequest
);

export default router; 