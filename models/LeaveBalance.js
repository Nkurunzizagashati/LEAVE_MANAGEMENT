import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema({
  userId: {
    type: String,  // ID from Authentication Service
    required: true
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  totalBalance: {
    type: Number,
    default: 0
  },
  usedBalance: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  carriedOverBalance: {
    type: Number,
    default: 0
  },
  lastAccrualDate: {
    type: Date,
    default: Date.now
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique balance per user, leave type, and year
leaveBalanceSchema.index({ userId: 1, leaveType: 1, year: 1 }, { unique: true });

export default mongoose.model('LeaveBalance', leaveBalanceSchema); 