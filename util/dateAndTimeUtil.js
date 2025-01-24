const moment = require('moment');  // Using moment.js for date formatting

function generateTimeStampOTP() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10); // Add 10 minutes to current time
    return now;
}

// Function to generate timestamp in the given format: YYYY-MM-DDTHH:mm:ss.nnnnnnnnnZ
function generateTimeStamp() {
    const now = moment();  // Get current date and time
    const nanoseconds = now.milliseconds() * 1000000;  // Convert milliseconds to nanoseconds
    return `${now.format('YYYY-MM-DDTHH:mm:ss')}.${String(nanoseconds).padStart(9, '0')}Z`;
}

// Function to validate date in ISO 8601 format (with nanoseconds)
function validateDate(value) {
    const date = moment(value, moment.ISO_8601, true);
    if (!date.isValid()) {
        return false;
    }

    // Check if the nanoseconds part exists and is 9 digits long, and ends with 'Z'
    const parts = value.split('.');
    if (parts.length > 1) {
        const [seconds, nanoseconds] = parts;
        if (nanoseconds.length !== 9 || !value.endsWith('Z')) {
            return false;
        }
    }

    // Check if the provided date is in the future
    if (date.isBefore(moment())) {
        return false;
    }

    return true;
}

module.exports = { generateTimeStampOTP, generateTimeStamp, validateDate };
