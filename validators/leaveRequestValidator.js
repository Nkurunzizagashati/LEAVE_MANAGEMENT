import { body } from 'express-validator';

export const createLeaveRequestValidation = {
  type: {
    notEmpty: {
      errorMessage: 'Leave type is required'
    },
    isString: {
      errorMessage: 'Leave type must be a string'
    },
    isIn: {
      options: [['annual', 'sick', 'maternity', 'paternity', 'unpaid']],
      errorMessage: 'Invalid leave type. Must be one of: annual, sick, maternity, paternity, unpaid'
    }
  },
  startDate: {
    notEmpty: {
      errorMessage: 'Start date is required'
    },
    isDate: {
      errorMessage: 'Invalid start date format'
    },
    custom: {
      options: (value, { req }) => {
        const startDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          throw new Error('Start date cannot be in the past');
        }
        return true;
      }
    }
  },
  endDate: {
    notEmpty: {
      errorMessage: 'End date is required'
    },
    isDate: {
      errorMessage: 'Invalid end date format'
    },
    custom: {
      options: (value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error('End date cannot be before start date');
        }
        return true;
      }
    }
  },
  reason: {
    notEmpty: {
      errorMessage: 'Reason is required'
    },
    isString: {
      errorMessage: 'Reason must be a string'
    },
    isLength: {
      options: { min: 10, max: 500 },
      errorMessage: 'Reason must be between 10 and 500 characters'
    }
  },
  documents: {
    optional: true,
    isArray: {
      errorMessage: 'Documents must be an array'
    }
  }
};

export const updateLeaveRequestStatusValidation = {
  status: {
    notEmpty: {
      errorMessage: 'Status is required'
    },
    isIn: {
      options: [['pending', 'approved', 'rejected']],
      errorMessage: 'Invalid status'
    }
  },
  rejectionReason: {
    optional: true,
    if: {
      options: (value, { req }) => req.body.status === 'rejected'
    },
    notEmpty: {
      errorMessage: 'Rejection reason is required when status is rejected'
    },
    isLength: {
      options: { min: 10 },
      errorMessage: 'Rejection reason must be at least 10 characters long'
    }
  }
}; 