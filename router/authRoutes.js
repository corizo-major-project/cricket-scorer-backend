const express = require("express");
const router = express.Router();
const authHandler = require("../handler/authHandler");

router.get("/sendOtp/:phone", sendOtp);
function sendOtp(req, res) {
    const phone = req.params.phone;
    const request = req; 
    return authHandler.sendOtpHandler(phone, request, res);
}

router.get("/sendOtpEmail/:email/:otpType", sendEmail);
function sendEmail(req, res) {
    const email = req.params.email;
    const otpType = req.params.otpType;
    return authHandler.sendEmailHandler(email, otpType, req, res);
}

router.get("/validateOtp/:email/:otp/:otpType", validateOtp);
function validateOtp(req, res) {
    const email = req.params.email;
    const otp = req.params.otp;
    const otpType = req.params.otpType;
    return authHandler.validateOtpHandler(email, otp, otpType, req, res);
}

router.get("/checkValidatedEmail/:email", checkValidatedEmail);
function checkValidatedEmail(req, res) {
    const email = req.params.email;
    return authHandler.checkValidatedEmailHandler(email, req, res);
}

router.post("/signup", userSignup);
function userSignup(req, res) {
    return authHandler.userSignupHandler(req, res);
}

router.post("/signin", userSignin);
function userSignin(req, res) {
    return authHandler.userSigninHandler(req, res);
}

router.patch("/changePassword", changePassword);
function changePassword(req, res) {
    return authHandler.changePasswordHandler(req, res);
}

module.exports = router;


