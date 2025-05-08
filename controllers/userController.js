import { initializeUserLeaveBalances } from './leaveBalanceController.js';

export const initializeUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Initialize leave balances for the new user
    await initializeUserLeaveBalances(userId);

    res.json({
      success: true,
      message: 'User initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize user',
      error: error.message
    });
  }
}; 