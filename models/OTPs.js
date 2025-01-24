const mongoose = require('mongoose');

// Define the schema for the OTPs collection
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    hashedOtp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    isValidated: { type: Boolean, required: true },
    otpType: {
        type: String,
        enum: ["EMAILVERIFICATION", "PASSWORDRESET", "2FA"], 
        required: true,          
        default: "EMAILVERIFICATION"          
    },
});

const OTP = mongoose.model('otps', otpSchema);

module.exports = OTP;
