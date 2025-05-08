import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Notification from '../models/Notification.js';
import axios from 'axios';
import { validationResult, matchedData } from 'express-validator';
import LeaveType from '../models/LeaveType.js';
import { sendLeaveRequestStatusEmail, sendLeaveRequestNotificationToManager } from '../utils/emailService.js';
import { calculateBusinessDays, validateLeaveDateRange } from '../utils/dateUtils.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export const createLeaveRequest = async (req, res) => {
  try {
    const { userId } = req.user;
    const { leaveType, startDate, endDate, reason } = req.body;

    // Find the leave type
    const leaveTypeDoc = await LeaveType.findOne({ name: leaveType });
    if (!leaveTypeDoc) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    // Calculate number of business days
    const numberOfDays = calculateBusinessDays(startDate, endDate);

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      userId,
      leaveType: leaveTypeDoc._id,
      year: currentYear
    });

    if (!leaveBalance || leaveBalance.availableBalance < numberOfDays) {
      return res.status(400).json({
        message: 'Insufficient leave balance',
        availableBalance: leaveBalance?.availableBalance || 0,
        requestedDays: numberOfDays
      });
    }

    // Validate documentation requirements
    if (leaveTypeDoc.requiresDocumentation && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: 'Documentation is required for this leave type'
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      userId,
      leaveType: leaveTypeDoc._id,
      startDate,
      endDate,
      numberOfDays,
      reason,
      documents: req.files?.map(file => ({
        url: file.path,
        name: file.originalname,
        uploadedAt: new Date()
      }))
    });

    await leaveRequest.save();

    // Create notification
    await Notification.create({
      userId,
      type: 'leave_request_created',
      title: 'Leave Request Submitted',
      message: `Your ${leaveType} leave request for ${numberOfDays} days has been submitted`
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const { userId } = req.user;
    const leaveRequests = await LeaveRequest.find({ userId })
      .populate('leaveType')
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('leaveType');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (status === 'approved') {
      // Update leave balance
      const currentYear = new Date().getFullYear();
      const leaveBalance = await LeaveBalance.findOne({
        userId: leaveRequest.userId,
        leaveType: leaveRequest.leaveType,
        year: currentYear
      });

      if (!leaveBalance || leaveBalance.availableBalance < leaveRequest.numberOfDays) {
        return res.status(400).json({
          message: 'Insufficient leave balance',
          availableBalance: leaveBalance?.availableBalance || 0,
          requestedDays: leaveRequest.numberOfDays
        });
      }

      leaveBalance.availableBalance -= leaveRequest.numberOfDays;
      leaveBalance.usedBalance += leaveRequest.numberOfDays;
      await leaveBalance.save();

      leaveRequest.approvedBy = req.user.userId;
      leaveRequest.approvedAt = new Date();
    }

    if (status === 'rejected') {
      leaveRequest.rejectionReason = rejectionReason;
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    // Create notification
    await Notification.create({
      userId: leaveRequest.userId,
      type: 'leave_request_updated',
      title: 'Leave Request ' + status.charAt(0).toUpperCase() + status.slice(1),
      message: `Your ${leaveRequest.leaveType.name} leave request has been ${status}`
    });

    res.json(leaveRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLeaveRequestById = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('leaveType');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, reason, documents } = req.body;
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow updates if request is pending
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update processed leave request' });
    }

    // Calculate new number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance if days increased
    if (numberOfDays > leaveRequest.numberOfDays) {
      const additionalDays = numberOfDays - leaveRequest.numberOfDays;
      const currentYear = new Date().getFullYear();
      const leaveBalance = await LeaveBalance.findOne({
        userId: leaveRequest.userId,
        leaveType: leaveRequest.leaveType,
        year: currentYear
      });

      if (!leaveBalance || leaveBalance.availableBalance < additionalDays) {
        return res.status(400).json({ message: 'Insufficient leave balance for extended duration' });
      }
    }

    // Update the request
    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.numberOfDays = numberOfDays;
    leaveRequest.reason = reason;
    leaveRequest.documents = documents;

    await leaveRequest.save();

    res.json(leaveRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow deletion if request is pending
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete processed leave request' });
    }

    await leaveRequest.deleteOne();
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingLeaveRequests = async (req, res) => {
  try {
    const { role, department } = req.user;
    console.log('Getting pending requests for:', { role, department });

    // Get all users from auth service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users`, {
      headers: { Authorization: req.headers.authorization }
    });

    console.log("RESPONSE: ", response);

    return res.status(200).json({message: "All users fetched successfully", response: response.data});

    // Get user IDs based on role
    let teamUserIds;
    if (role !== 'ADMIN') {
      teamUserIds = response.data.map(user => user.id);
      return res.status(200).json({message: "All users fetched successfully", teamUserIds});
    } else {
      // For managers, only get users from their department
      teamUserIds = response?.data
        ?.filter(user => user.department === department)
        ?.map(user => user.id);
    }

    // Get pending leave requests for these users
    const pendingRequests = await LeaveRequest.find({
      userId: { $in: teamUserIds },
      status: 'pending'
    })
    .sort({ createdAt: -1 });

    // Get user details for each request
    const requestsWithUserDetails = await Promise.all(
      pendingRequests.map(async (request) => {
        const userResponse = await axios.get(`${AUTH_SERVICE_URL}/api/users/${request.userId}`, {
          headers: { Authorization: req.headers.authorization }
        });
        
        return {
          ...request.toObject(),
          user: {
            id: userResponse.data.id,
            firstName: userResponse.data.firstName,
            lastName: userResponse.data.lastName,
            email: userResponse.data.email,
            jobTitle: userResponse.data.jobTitle
          }
        };
      })
    );

    res.json({
      success: true,
      data: requestsWithUserDetails
    });
  } catch (error) {
    console.error('Error getting pending leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending leave requests',
      error: error.message
    });
  }
}; 