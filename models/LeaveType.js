import mongoose from 'mongoose';

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'annual',
      'sick',
      'maternity',
      'paternity',
      'compassionate',
      'study'
    ]
  },
  description: {
    type: String,
    required: true
  },
  requiresDocumentation: {
    type: Boolean,
    default: false
  },
  requiresReason: {
    type: Boolean,
    default: true
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  accrualRate: {
    type: Number,
    default: 0
  },
  maxCarryOver: {
    type: Number,
    default: 0
  },
  carryOverExpiryDate: {
    type: Date,
    default: () => new Date(new Date().getFullYear(), 0, 31)
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('LeaveType', leaveTypeSchema); 