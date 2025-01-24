const logger = require('../connectors/logger');
const OTP = require("../models/OTPs");

exports.insertOTP = async (otpData) => {
    try {
        const otp = new OTP(otpData)  // Create a new Event instance with event data
        await otp.save();  // Save the event to the database
        logger.info('OTP inserted successfully');
    } catch (error) {
        logger.error('Error inserting OTP:', error);
    }
};

exports.getOTPRecord = async (email, otpType) => {
    try {
        return await OTP.findOne({ email, otpType });
    } catch (error) {
        logger.error('Error in getOTPRecord:', error);
    }
};


exports.deleteOTP = async (email) => {
    try {
        await OTP.deleteOne({ email });
        logger.info("OTP record deleted successfully");
    } catch (error) {
        logger.error("Error deleting OTP record:", error);
        throw new Error("Failed to delete OTP record");
    }
};

exports.updateOTPValidation = async (email, otpType) => {
    try {
        // Find and update the matching OTP record
        const updatedRecord = await OTP.findOneAndUpdate(
            { email, otpType }, // Match by email and otpType
            { isValidated: true }, // Set isValidated to true
            { new: true } // Return the updated document
        );

        if (!updatedRecord) {
            logger.info("No matching OTP record found");
            throw new Error("No matching OTP record found");
        }

        logger.info("OTP record updated successfully");
        return updatedRecord; // Return the updated record for reference
    } catch (error) {
        logger.error("Error updating OTP record:", error);
        throw new Error("Failed to update OTP record");
    }
};


exports.isEmailValidated = async (email) => {
    try {
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return { validated: false, reason: "OTP not found or expired." };
        }
        return { validated: otpRecord.isValidated, reason: otpRecord.isValidated ? "" : "Email OTP not verified." };
    } catch (error) {
        logger.error("Error in isEmailValidated:", error);
        throw new Error("Failed to check email validation");
    }
};

exports.getPendingOTPRequest = async (email, otpType) => {
    try {
        const existingRequest = await OTP.findOne({
            email: email,
            otpType: otpType,
            otpExpiry: { $gt: new Date() }, // Check for unexpired OTP
        });

        return existingRequest; // Return existing OTP record, if found
    } catch (error) {
        console.error("Error in getPendingOTPRequest:", error);
        throw new Error("Failed to fetch pending OTP request");
    }
};
