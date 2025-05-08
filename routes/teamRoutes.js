import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { getTeamMembers, getTeamLeaveRequests, getTeamStatus } from '../controllers/teamController.js';

const router = express.Router();

// Get all members (based on user's role and department)
router.get('/members', verifyToken, getTeamMembers);

// Get all leave requests (restricted to managers and admins)
router.get('/requests', verifyToken, getTeamLeaveRequests);

// Get current leave status of team members
router.get('/status', verifyToken, getTeamStatus);

export default router; 