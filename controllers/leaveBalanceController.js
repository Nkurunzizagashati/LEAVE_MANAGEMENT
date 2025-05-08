import LeaveBalance from '../models/LeaveBalance.js';
import LeaveType from '../models/LeaveType.js';
import Notification from '../models/Notification.js';

export const getLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.user;
    const currentYear = new Date().getFullYear();

    const leaveBalances = await LeaveBalance.find({
      userId,
      year: currentYear
    }).populate('leaveType');

    res.json(leaveBalances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveBalance = async (req, res) => {
  try {
    const { userId, leaveType, adjustment, reason } = req.body;
    const currentYear = new Date().getFullYear();

    const leaveBalance = await LeaveBalance.findOne({
      userId,
      leaveType,
      year: currentYear
    });

    if (!leaveBalance) {
      return res.status(404).json({ message: 'Leave balance not found' });
    }

    leaveBalance.totalBalance += adjustment;
    leaveBalance.availableBalance += adjustment;
    await leaveBalance.save();

    // Create notification for the user
    await Notification.create({
      userId,
      type: 'balance_updated',
      title: 'Leave Balance Updated',
      message: `Your leave balance has been ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)} days. Reason: ${reason}`
    });

    res.json(leaveBalance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const processMonthlyAccrual = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Get all active leave types
    const leaveTypes = await LeaveType.find({ isActive: true });

    // Process accrual for each leave type
    for (const leaveType of leaveTypes) {
      const leaveBalances = await LeaveBalance.find({
        leaveType: leaveType._id,
        year: currentYear
      });

      for (const balance of leaveBalances) {
        // Only process annual leave accrual
        if (leaveType.name === 'annual') {
          balance.totalBalance += leaveType.accrualRate;
          balance.availableBalance += leaveType.accrualRate;
          balance.lastAccrualDate = new Date();
          await balance.save();

          // Create notification for the user
          await Notification.create({
            userId: balance.userId,
            type: 'balance_updated',
            title: 'Monthly Leave Accrual',
            message: `${leaveType.accrualRate} days have been added to your ${leaveType.name} balance`
          });
        }
      }
    }

    res.json({ message: 'Monthly accrual processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const initializeUserLeaveBalances = async (userId) => {
  try {
    const currentYear = new Date().getFullYear();
    const leaveTypes = await LeaveType.find({ isActive: true });

    for (const leaveType of leaveTypes) {
      const existingBalance = await LeaveBalance.findOne({
        userId,
        leaveType: leaveType._id,
        year: currentYear
      });

      if (!existingBalance) {
        let initialBalance = 0;
        let accrualRate = 0;
        let maxCarryOver = 0;
        let requiresDocumentation = false;
        
        switch (leaveType.name) {
          case 'annual':
            initialBalance = 0; // Start with 0, will accrue monthly
            accrualRate = 1.66; // 20/12 months
            maxCarryOver = 5; // Maximum 5 days carryover
            requiresDocumentation = false;
            break;

          case 'sick':
            initialBalance = 15; // 15 days per year
            accrualRate = 0; // No monthly accrual
            maxCarryOver = 0; // No carryover
            requiresDocumentation = true;
            break;

          case 'maternity':
            initialBalance = 98; // 14 weeks
            accrualRate = 0;
            maxCarryOver = 0;
            requiresDocumentation = true;
            break;

          case 'paternity':
            initialBalance = 7;
            accrualRate = 0;
            maxCarryOver = 0;
            requiresDocumentation = true;
            break;

          case 'compassionate':
            initialBalance = 7; // Using the highest bereavement leave duration
            accrualRate = 0;
            maxCarryOver = 0;
            requiresDocumentation = true;
            break;

          case 'study':
            initialBalance = 0; // Granted as needed
            accrualRate = 0;
            maxCarryOver = 0;
            requiresDocumentation = true;
            break;
        }

        // Update leave type with correct settings
        await LeaveType.findByIdAndUpdate(leaveType._id, {
          accrualRate,
          maxCarryOver,
          requiresDocumentation,
          carryOverExpiryDate: new Date(currentYear, 0, 31) // January 31st
        });

        // Create leave balance
        const leaveBalance = new LeaveBalance({
          userId,
          leaveType: leaveType._id,
          totalBalance: initialBalance,
          availableBalance: initialBalance,
          usedBalance: 0,
          carriedOverBalance: 0,
          year: currentYear,
          lastAccrualDate: new Date()
        });

        await leaveBalance.save();

        // Create notification
        await Notification.create({
          userId,
          type: 'balance_initialized',
          title: 'Leave Balance Initialized',
          message: `Your ${leaveType.name} leave balance has been initialized. ${leaveType.name === 'annual' ? 'It will accrue 1.66 days monthly.' : `Initial balance: ${initialBalance} days.`}`
        });
      }
    }
  } catch (error) {
    console.error('Error initializing leave balances:', error);
    throw error;
  }
};

export const processYearEndCarryover = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // Get all annual leave balances
    const leaveType = await LeaveType.findOne({ name: 'annual' });
    const leaveBalances = await LeaveBalance.find({
      leaveType: leaveType._id,
      year: currentYear
    });

    for (const balance of leaveBalances) {
      // Calculate carryover amount (max 5 days)
      const carryoverAmount = Math.min(balance.availableBalance, leaveType.maxCarryOver);

      if (carryoverAmount > 0) {
        // Create new balance for next year
        const newBalance = new LeaveBalance({
          userId: balance.userId,
          leaveType: leaveType._id,
          year: nextYear,
          totalBalance: 20 + carryoverAmount, // 20 days new year + carryover
          availableBalance: 20 + carryoverAmount,
          usedBalance: 0,
          carriedOverBalance: carryoverAmount,
          lastAccrualDate: new Date()
        });

        await newBalance.save();

        // Create notification
        await Notification.create({
          userId: balance.userId,
          type: 'balance_updated',
          title: 'Leave Balance Carryover',
          message: `${carryoverAmount} days have been carried over to next year`
        });
      }
    }

    res.json({ message: 'Year-end carryover processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLeaveBalances = async (req, res) => {
  try {
    const { userId } = req.user;
    const currentYear = new Date().getFullYear();

    // Get all leave types first
    const leaveTypes = await LeaveType.find({ isActive: true });

    // Get all leave balances for the user for the current year
    const leaveBalances = await LeaveBalance.find({
      userId,
      year: currentYear
    }).populate('leaveType');

    // Create a map of existing balances for quick lookup
    const balanceMap = new Map();
    leaveBalances.forEach(balance => {
      balanceMap.set(balance.leaveType._id.toString(), balance);
    });

    // Create response array with all leave types, including those without balances
    const response = leaveTypes.map(leaveType => {
      const existingBalance = balanceMap.get(leaveType._id.toString());
      
      if (existingBalance) {
        return {
          leaveType: {
            _id: leaveType._id,
            name: leaveType.name,
            description: leaveType.description,
            isActive: leaveType.isActive,
            accrualRate: leaveType.accrualRate,
            requiresDocumentation: leaveType.requiresDocumentation
          },
          totalBalance: existingBalance.totalBalance,
          usedBalance: existingBalance.usedBalance,
          availableBalance: existingBalance.availableBalance,
          carriedOverBalance: existingBalance.carriedOverBalance,
          lastAccrualDate: existingBalance.lastAccrualDate,
          year: existingBalance.year
        };
      } else {
        // If no balance exists for this leave type, create a default one
        return {
          leaveType: {
            _id: leaveType._id,
            name: leaveType.name,
            description: leaveType.description,
            isActive: leaveType.isActive,
            accrualRate: leaveType.accrualRate,
            requiresDocumentation: leaveType.requiresDocumentation
          },
          totalBalance: 0,
          usedBalance: 0,
          availableBalance: 0,
          carriedOverBalance: 0,
          lastAccrualDate: null,
          year: currentYear
        };
      }
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error getting all leave balances:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch leave balances',
      error: error.message 
    });
  }
}; 