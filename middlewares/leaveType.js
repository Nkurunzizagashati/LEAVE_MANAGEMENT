const createLeaveTypeValidator = {
    name: {
        notEmpty: {
            errorMessage: 'Name should not be empty'
        },
        isString: {
            errorMessage: 'Name should be a string'
        },
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: 'Name should be between 2 and 50 characters'
        }
    },
    description: {
        optional: { options: { nullable: true } },
        isString: {
            errorMessage: 'Description should be a string'
        },
        isLength: {
            options: { max: 500 },
            errorMessage: 'Description should not exceed 500 characters'
        }
    },
    requiresDocumentation: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Requires documentation should be a boolean'
        }
    },
    requiresReason: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Requires reason should be a boolean'
        }
    },
    isPaid: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Is paid should be a boolean'
        }
    },
    accrualRate: {
        optional: { options: { nullable: true } },
        isFloat: {
            options: { min: 0, max: 31 },
            errorMessage: 'Accrual rate should be between 0 and 31'
        }
    },
    maxCarryOver: {
        optional: { options: { nullable: true } },
        isFloat: {
            options: { min: 0, max: 31 },
            errorMessage: 'Max carry over should be between 0 and 31'
        }
    },
    carryOverExpiryDate: {
        optional: { options: { nullable: true } },
        isISO8601: {
            errorMessage: 'Carry over expiry date should be a valid date'
        }
    },
    isActive: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Is active should be a boolean'
        }
    }
};

const updateLeaveTypeValidator = {
    name: {
        optional: { options: { nullable: true } },
        isString: {
            errorMessage: 'Name should be a string'
        },
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: 'Name should be between 2 and 50 characters'
        }
    },
    description: {
        optional: { options: { nullable: true } },
        isString: {
            errorMessage: 'Description should be a string'
        },
        isLength: {
            options: { max: 500 },
            errorMessage: 'Description should not exceed 500 characters'
        }
    },
    requiresDocumentation: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Requires documentation should be a boolean'
        }
    },
    requiresReason: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Requires reason should be a boolean'
        }
    },
    isPaid: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Is paid should be a boolean'
        }
    },
    accrualRate: {
        optional: { options: { nullable: true } },
        isFloat: {
            options: { min: 0, max: 31 },
            errorMessage: 'Accrual rate should be between 0 and 31'
        }
    },
    maxCarryOver: {
        optional: { options: { nullable: true } },
        isFloat: {
            options: { min: 0, max: 31 },
            errorMessage: 'Max carry over should be between 0 and 31'
        }
    },
    carryOverExpiryDate: {
        optional: { options: { nullable: true } },
        isISO8601: {
            errorMessage: 'Carry over expiry date should be a valid date'
        }
    },
    isActive: {
        optional: { options: { nullable: true } },
        isBoolean: {
            errorMessage: 'Is active should be a boolean'
        }
    }
};

export { createLeaveTypeValidator, updateLeaveTypeValidator }; 