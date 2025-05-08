import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  userId: {
    type: String,  // This will be the ID from the Authentication Service
    required: true
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [{
    url: String,
    name: String,
    uploadedAt: Date
  }],
  rejectionReason: {
    type: String
  },
  approvedBy: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  comments: [{
    userId: String,  // ID from the Authentication Service
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('LeaveRequest', leaveRequestSchema); 