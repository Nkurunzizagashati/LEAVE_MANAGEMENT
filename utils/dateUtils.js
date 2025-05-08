/**
 * Checks if a date is a weekend (Saturday or Sunday)
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is a weekend
 */
const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

/**
 * Calculates the number of business days between two dates
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} - Number of business days
 */
export const calculateBusinessDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let count = 0;
    const curDate = new Date(start.getTime());
    
    while (curDate <= end) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
};

/**
 * Validates if a date range is valid for leave request
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {Object} - Validation result with isValid and message
 */
export const validateLeaveDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
            isValid: false,
            message: 'Invalid date format'
        };
    }

    // Check if start date is before end date
    if (start > end) {
        return {
            isValid: false,
            message: 'Start date must be before or equal to end date'
        };
    }

    // Check if start date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
        return {
            isValid: false,
            message: 'Start date cannot be in the past'
        };
    }

    return {
        isValid: true,
        message: 'Date range is valid'
    };
}; 