import { initializeUserLeaveBalances } from './leaveBalanceController.js';

export const initializeUser = async (req, res) => {
  try {
    console.log('🔔 User initialization endpoint called');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Request IP:', req.ip);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.originalUrl);

    const { userId } = req.body;

    if (!userId) {
      console.log('❌ User initialization failed: No userId provided');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log(`🔄 Initializing leave balances for user: ${userId}`);

    // Initialize leave balances for the new user
    await initializeUserLeaveBalances(userId);

    console.log(`✅ Successfully initialized leave balances for user: ${userId}`);

    const response = {
      success: true,
      message: 'User initialized successfully'
    };

    console.log('📤 Sending response to auth service:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Error initializing user:', error);
    const errorResponse = {
      success: false,
      message: 'Failed to initialize user',
      error: error.message
    };
    console.log('📤 Sending error response to auth service:', errorResponse);
    res.status(500).json(errorResponse);
  }
}; 