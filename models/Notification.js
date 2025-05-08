import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'balance_initialized',
      'balance_updated',
      'leave_request_created',
      'leave_request_updated',
      'leave_request_approved',
      'leave_request_rejected',
      'monthly_accrual',
      'year_end_carryover'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedLeaveRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveRequest'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema); 