import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { initializeUser } from '../controllers/userController.js';

const router = express.Router();

// This endpoint should be called by the authentication service when a new user is created
router.post('/initialize', initializeUser);

export default router; 