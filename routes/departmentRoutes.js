import express from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(verifyToken, checkRole(['ADMIN']));

// Create a new department
router.post('/', createDepartment);

// Get all departments
router.get('/', getDepartments);

// Get a specific department
router.get('/:id', getDepartmentById);

// Update a department
router.put('/:id', updateDepartment);

// Delete a department
router.delete('/:id', deleteDepartment);

export default router; 