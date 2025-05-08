import cron from 'node-cron';
import LeaveBalance from '../models/LeaveBalance.js';
import LeaveType from '../models/LeaveType.js';
import Notification from '../models/Notification.js';

// Function to process monthly accrual
const processMonthlyAccrual = async () => {
  try {
    console.log('Starting monthly leave accrual process...');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Get annual leave type
    const annualLeaveType = await LeaveType.findOne({ name: 'annual', isActive: true });
    if (!annualLeaveType) {
      console.error('Annual leave type not found');
      return;
    }

    // Get all active annual leave balances
    const leaveBalances = await LeaveBalance.find({
      leaveType: annualLeaveType._id,
      year: currentYear
    });

    console.log(`Processing ${leaveBalances.length} leave balances...`);

    for (const balance of leaveBalances) {
      try {
        // Calculate months since start of year
        const monthsSinceStart = currentMonth + 1; // +1 because months are 0-based
        
        // Calculate expected total balance (monthly accruals only)
        const expectedTotal = annualLeaveType.accrualRate * monthsSinceStart;
        
        // Only add the monthly accrual if we haven't reached the expected total
        if (balance.totalBalance < expectedTotal) {
          const previousTotal = balance.totalBalance;
          balance.totalBalance += annualLeaveType.accrualRate;
          balance.availableBalance += annualLeaveType.accrualRate;
          balance.lastAccrualDate = new Date();
          await balance.save();

          // Create notification
          await Notification.create({
            userId: balance.userId,
            type: 'monthly_accrual',
            title: 'Monthly Leave Accrual',
            message: `Your annual leave balance has been increased by ${annualLeaveType.accrualRate} days (from ${previousTotal.toFixed(2)} to ${balance.totalBalance.toFixed(2)} days)`
          });

          console.log(`Processed accrual for user ${balance.userId}: ${previousTotal.toFixed(2)} -> ${balance.totalBalance.toFixed(2)}`);
        } else {
          console.log(`Skipping accrual for user ${balance.userId}: Already at expected total of ${expectedTotal.toFixed(2)}`);
        }
      } catch (error) {
        console.error(`Error processing balance for user ${balance.userId}:`, error);
        // Continue with next balance even if one fails
      }
    }

    console.log('Monthly leave accrual process completed');
  } catch (error) {
    console.error('Error in monthly accrual process:', error);
  }
};

// Function to process year-end carryover
const processYearEndCarryover = async () => {
  try {
    console.log('Starting year-end carryover process...');
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // Get annual leave type
    const annualLeaveType = await LeaveType.findOne({ name: 'annual', isActive: true });
    if (!annualLeaveType) {
      console.error('Annual leave type not found');
      return;
    }

    // Get all annual leave balances for current year
    const leaveBalances = await LeaveBalance.find({
      leaveType: annualLeaveType._id,
      year: currentYear
    });

    console.log(`Processing carryover for ${leaveBalances.length} leave balances...`);

    for (const balance of leaveBalances) {
      try {
        // Calculate carryover amount (max 5 days)
        const carryoverAmount = Math.min(balance.availableBalance, annualLeaveType.maxCarryOver);

        if (carryoverAmount > 0) {
          // Create new balance for next year
          const newBalance = new LeaveBalance({
            userId: balance.userId,
            leaveType: annualLeaveType._id,
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
            type: 'year_end_carryover',
            title: 'Leave Balance Carryover',
            message: `${carryoverAmount} days have been carried over to next year`
          });

          console.log(`Processed carryover for user ${balance.userId}`);
        }
      } catch (error) {
        console.error(`Error processing carryover for user ${balance.userId}:`, error);
        // Continue with next balance even if one fails
      }
    }

    console.log('Year-end carryover process completed');
  } catch (error) {
    console.error('Error in year-end carryover process:', error);
  }
};

// Initialize scheduler
export const initializeScheduler = () => {
  // Run monthly accrual on the 1st day of each month at 00:01
  cron.schedule('1 0 1 * *', () => {
    console.log('Running monthly accrual job...');
    processMonthlyAccrual();
  });

  // Run year-end carryover on December 31st at 23:59
  cron.schedule('59 23 31 12 *', () => {
    console.log('Running year-end carryover job...');
    processYearEndCarryover();
  });

  console.log('Leave management scheduler initialized');
}; 