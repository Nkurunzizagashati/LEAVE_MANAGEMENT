const createLeaveRequestValidator = {
    leaveTypeId: {
        notEmpty: {
            errorMessage: 'Leave type ID should not be empty'
        },
        isMongoId: {
            errorMessage: 'Invalid leave type ID'
        }
    },
    startDate: {
        notEmpty: {
            errorMessage: 'Start date should not be empty'
        },
        isISO8601: {
            errorMessage: 'Start date should be a valid date'
        }
    },
    endDate: {
        notEmpty: {
            errorMessage: 'End date should not be empty'
        },
        isISO8601: {
            errorMessage: 'End date should be a valid date'
        },
        custom: {
            options: (value, { req }) => {
                if (new Date(value) < new Date(req.body.startDate)) {
                    throw new Error('End date must be after start date');
                }
                return true;
            }
        }
    },
    reason: {
        notEmpty: {
            errorMessage: 'Reason should not be empty'
        },
        isString: {
            errorMessage: 'Reason should be a string'
        },
        isLength: {
            options: { min: 10, max: 500 },
            errorMessage: 'Reason should be between 10 and 500 characters'
        }
    },
    documentation: {
        optional: { options: { nullable: true } },
        isURL: {
            errorMessage: 'Documentation should be a valid URL'
        }
    },
    status: {
        optional: { options: { nullable: true } },
        isIn: {
            options: [['pending', 'approved', 'rejected', 'cancelled']],
            errorMessage: 'Invalid status'
        }
    },
    approverId: {
        optional: { options: { nullable: true } },
        isMongoId: {
            errorMessage: 'Invalid approver ID'
        }
    },
    approverComment: {
        optional: { options: { nullable: true } },
        isString: {
            errorMessage: 'Approver comment should be a string'
        },
        isLength: {
            options: { max: 500 },
            errorMessage: 'Approver comment should not exceed 500 characters'
        }
    }
};

const updateLeaveRequestValidator = {
    startDate: {
        optional: { options: { nullable: true } },
        isISO8601: {
            errorMessage: 'Start date should be a valid date'
        }
    },
    endDate: {
        optional: { options: { nullable: true } },
        isISO8601: {
            errorMessage: 'End date should be a valid date'
        },
        custom: {
            options: (value, { req }) => {
                if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
                    throw new Error('End date must be after start date');
                }
                return true;
            }
        }
    },
    reason: {
        optional: { options: { nullable: true } },
        isString: {
            errorMessage: 'Reason should be a string'
        },
        isLength: {
            options: { min: 10, max: 500 },
            errorMessage: 'Reason should be between 10 and 500 characters'
        }
    },
    documentation: {
        optional: { options: { nullable: true } },
        isURL: {
            errorMessage: 'Documentation should be a valid URL'
        }
    },
    status: {
        optional: { options: { nullable: true } },
        isIn: {
            options: [['pending', 'approved', 'rejected', 'cancelled']],
            errorMessage: 'Invalid status'
        }
    },
    approverId: {
        optional: { options: { nullable: true } },
        isMongoId: {
            errorMessage: 'Invalid approver ID'
        }
    },
    approverComment: {
        optional: { options: { nullable: true } },
        isString: {
            errorMessage: 'Approver comment should be a string'
        },
        isLength: {
            options: { max: 500 },
            errorMessage: 'Approver comment should not exceed 500 characters'
        }
    }
};

const approveLeaveRequestValidator = {
    status: {
        notEmpty: {
            errorMessage: 'Status should not be empty'
        },
        isIn: {
            options: [['approved', 'rejected']],
            errorMessage: 'Status must be either approved or rejected'
        }
    },
    approverComment: {
        optional: { options: { nullable: true } },
        isString: {
            errorMessage: 'Approver comment should be a string'
        },
        isLength: {
            options: { max: 500 },
            errorMessage: 'Approver comment should not exceed 500 characters'
        }
    }
};

export { createLeaveRequestValidator, updateLeaveRequestValidator, approveLeaveRequestValidator }; 