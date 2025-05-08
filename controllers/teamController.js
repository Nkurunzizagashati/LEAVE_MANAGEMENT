import axios from 'axios';
import LeaveRequest from '../models/LeaveRequest.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export const getTeamMembers = async (req, res) => {
  try {
    const { role, department } = req.user;
    
    // Get all users from auth service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users`, {
      headers: { 
        Authorization: req.headers.authorization,
        'X-User-Role': role,
        'X-Request-Type': 'team-members'
      }
    });

    console.log("ROLE: ", role);
    console.log("DEPARTMENT: ", department);
    console.log("RESPONSE DATA: ", response.data);

    // Ensure response.data is an array
    const users = Array.isArray(response.data) ? response.data : 
                 (response.data.data && Array.isArray(response.data.data)) ? response.data.data : 
                 [];

    // Filter users based on role and ensure they have valid roles
    let teamMembers;
    if (role === 'ADMIN') {
      teamMembers = users.filter(user => user && user.role);
    } else {
      teamMembers = users.filter(user => 
        user && user.role && user.department === department
      );
    }

    console.log("TEAM MEMBERS: ", teamMembers);

    // Get user IDs for leave status check
    const userIds = teamMembers.map(member => member.id.toString());
    console.log("User IDs to check:", userIds);
    
    // Create today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    console.log("Today's date for comparison (UTC):", today);

    // Log the query parameters
    const query = {
      userId: { $in: userIds },
      status: 'approved',
      startDate: { $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) }, // Add one day to include today
      endDate: { $gte: today }
    };
    console.log("MongoDB query:", JSON.stringify(query, null, 2));

    // Get active leave requests for these users
    const activeLeaveRequests = await LeaveRequest.find(query).populate('leaveType');
    
    // Log all leave requests for these users regardless of status
    const allLeaveRequests = await LeaveRequest.find({
      userId: { $in: userIds }
    });
    console.log("All leave requests for these users:", JSON.stringify(allLeaveRequests, null, 2));
    
    console.log("Active leave requests found:", activeLeaveRequests);

    // Create a map of users on leave with their leave details
    const usersOnLeave = new Map();
    activeLeaveRequests.forEach(request => {
      console.log("Processing leave request for userId:", request.userId);
      usersOnLeave.set(request.userId, {
        startDate: request.startDate,
        endDate: request.endDate,
        leaveType: request.leaveType.name,
        numberOfDays: request.numberOfDays
      });
    });
    
    console.log("Users on leave map:", Object.fromEntries(usersOnLeave));

    // Add leave status to each team member
    const teamMembersWithLeaveStatus = teamMembers.map(member => {
      const memberId = member.id.toString();
      const isOnLeave = usersOnLeave.has(memberId);
      console.log(`Checking leave status for ${member.firstName} ${member.lastName} (${memberId}):`, isOnLeave);
      return {
        ...member,
        onLeave: isOnLeave,
        leaveDetails: usersOnLeave.get(memberId) || null
      };
    });

    res.json({
      success: true,
      data: teamMembersWithLeaveStatus
    });
  } catch (error) {
    console.error('Error getting team members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team members',
      error: error.message
    });
  }
};

export const getTeamLeaveRequests = async (req, res) => {
  try {
    const { role, department } = req.user;

    // Check if user has permission to view requests
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only managers and admins can view leave requests.'
      });
    }
    
    // Get all users from auth service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users`, {
      headers: { 
        Authorization: req.headers.authorization,
        'X-User-Role': `ROLE_${role}`,
        'X-Request-Type': 'team-members'
      }
    });

    // Get user IDs based on role
    let teamUserIds;
    if (role === 'ADMIN') {
      teamUserIds = response.data.map(user => user._id);
    } else {
      teamUserIds = response.data
        .filter(user => user.department === department)
        .map(user => user._id);
    }

    // Get leave requests for these users
    const leaveRequests = await LeaveRequest.find({
      userId: { $in: teamUserIds }
    }).populate('leaveType');

    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    console.error('Error getting team leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team leave requests',
      error: error.message
    });
  }
};

export const getTeamStatus = async (req, res) => {
  try {
    const { role, department } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all users from auth service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users`, {
      headers: { 
        Authorization: req.headers.authorization,
        'X-User-Role': `ROLE_${role}`,
        'X-Request-Type': 'team-members'
      }
    });

    // Get team members based on role
    let teamMembers;
    if (role === 'ADMIN') {
      teamMembers = response.data.filter(user => user && user.role);
    } else {
      teamMembers = response.data.filter(user => 
        user && user.role && user.department === department
      );
    }

    // Get active leave requests for today
    const activeLeaveRequests = await LeaveRequest.find({
      userId: { $in: teamMembers.map(member => member._id) },
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    // Create a map of users on leave with their return dates
    const usersOnLeave = new Map(
      activeLeaveRequests.map(request => [request.userId, request.endDate])
    );

    // Create simplified status response
    const teamStatus = teamMembers.map(member => ({
      username: member.username,
      onLeave: usersOnLeave.has(member._id),
      ...(usersOnLeave.has(member._id) && {
        returnDate: usersOnLeave.get(member._id)
      })
    }));

    res.json({
      success: true,
      data: teamStatus
    });
  } catch (error) {
    console.error('Error getting team status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team status',
      error: error.message
    });
  }
}; 