const express = require("express");
const router = express.Router();
const authHandler = require("../handler/authHandler");

router.get("/sendOtp/:phone", sendOtp);
function sendOtp(req, res) {
    const phone = req.params.phone;
    const request = req; 
    return authHandler.sendOtpHandler(phone, request, res);
}

/**
 * @swagger
 * /v1/api/auth/sendOtpEmail/{email}/{otpType}:
 *   get:
 *     summary: Send OTP to an email
 *     tags: [Auth Routes]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *       - in: path
 *         name: otpType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of OTP (e.g., EMAILVERIFICATION, PASSWORDRESET, 2FA)
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email
 *       404:
 *         description: Email not found or User not found
 *       409: 
 *         description: Email already exists
 *       429:
 *         description: An OTP request is already in progress
 *       500:
 *         description: Internal server error
 *       
 */
router.get("/sendOtpEmail/:email/:otpType", sendEmail);
function sendEmail(req, res) {
    const email = req.params.email;
    const otpType = req.params.otpType;
    return authHandler.sendEmailHandler(email, otpType, req, res);
}

/**
 * @swagger
 * /v1/api/auth/validateOtp/{email}/{otp}/{otpType}:
 *   get:
 *     summary: Validate OTP to an email
 *     tags: [Auth Routes]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *       - in: path
 *         name: otp
 *         required: true
 *         schema:
 *           type: string
 *         description: OTP 6-digit code
 *       - in: path
 *         name: otpType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of OTP (e.g., EMAILVERIFICATION, PASSWORDRESET, 2FA)
 *     responses:
 *       200:
 *         description: OTP validated successfully
 *       400:
 *         description: Invalid OTP
 *       404: 
 *         description: OTP Not found or USER not found
 *       410:
 *         description: OTP has Expired
 *       500:
 *         description: Internal server error
 */
router.get("/validateOtp/:email/:otp/:otpType", validateOtp);
function validateOtp(req, res) {
    const email = req.params.email;
    const otp = req.params.otp;
    const otpType = req.params.otpType;
    return authHandler.validateOtpHandler(email, otp, otpType, req, res);
}

/**
 * @swagger
 * /v1/api/auth/checkValidatedEmail/{email}:
 *   get:
 *     summary: Check whether email is validated or not.
 *     tags: [Auth Routes]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email address
 *     responses:
 *       200:
 *         description: OTP validated successfully
 *       401:
 *         description: Email Not Verified
 *       409: 
 *         description: Email Already Exists
 *       500:
 *         description: Internal server error
 */
router.get("/checkValidatedEmail/:email", checkValidatedEmail);
function checkValidatedEmail(req, res) {
    const email = req.params.email;
    return authHandler.checkValidatedEmailHandler(email, req, res);
}

/**
 * @swagger
 * /v1/api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - email
 *               - phone
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               userName:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request (invalid input)
 *       500:
 *         description: Internal server error
 */
router.post("/signup", userSignup);
function userSignup(req, res) {
    return authHandler.userSignupHandler(req, res);
}

/**
 * @swagger
 * /v1/api/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Auth Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: User logged in Successfully
 *       202:
 *         description: Please Verify that its you
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *          description: Unauthorized
 *       404:
 *          description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/signin", userSignin);
function userSignin(req, res) {
    return authHandler.userSigninHandler(req, res);
}

/**
 * @swagger
 * /v1/api/auth/changePassword:
 *   patch:
 *     summary: Change user password
 *     tags: [Auth Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "oldSecurePassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "newSecurePassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request (invalid input)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/changePassword", changePassword);
function changePassword(req, res) {
    return authHandler.changePasswordHandler(req, res);
}


module.exports = router;


