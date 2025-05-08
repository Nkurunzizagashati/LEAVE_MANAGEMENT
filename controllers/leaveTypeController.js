import LeaveType from '../models/LeaveType.js';

export const createLeaveType = async (req, res) => {
  try {
    const leaveType = new LeaveType(req.body);
    await leaveType.save();
    res.status(201).json(leaveType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find();
    console.log("LEAVE TYPES: ", leaveTypes);
    return res.status(200).json({message: "Leave types fetched successfully", leaveTypes});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }
    res.json(leaveType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }
    res.json({ message: 'Leave type deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaveTypeById = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }
    res.json(leaveType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 