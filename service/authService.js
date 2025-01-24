// const twilio = require("twilio");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../connectors/logger");
const { generateHtmlTemplateOTP } = require("../util/templateGenerator");
const { sendMailForOTP } = require("../util/emailSender");
const { generateTimeStampOTP, generateTimeStamp } = require("../util/dateAndTimeUtil");
const { insertOTP, getOTPRecord, isEmailValidated, updateOTPValidation, getPendingOTPRequest } = require("../repository/otpRepository");
const { getUserDetails, insertUser, checkUserExistence, userLoginRepo, updateUserPassword, getUserDetailsUsername } = require("../repository/usersRepository");
const Users = require("../models/Users");
const { EmailVerification, PasswordReset, TwoFactorAuthentication } = require("../constants/otpConstants");

// const accountSid = "AC8d57ab6f4fe7a79f7e9dfc4e7f6f70b5";
// const authToken = "8b21baea41e5794a679cac33cfdf840c";
// const client = twilio(accountSid, authToken);

// exports.sendOtpService = async (phone, res) => {
//     try {
//         logger.info("authService.sendOtpService START")
//         if (!/^\+\d{10,15}$/.test(phone)) {
//             return res.status(400).json({ error: "Invalid phone number format" });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const hashedOtp = await bcrypt.hash(otp, 10);

//         const messageBody = `Thank you for registering to Score Liklo.
//         Your OTP to verify your phone number is:
//         OTP: ${otp}`;

//         await client.messages.create({
//             body: messageBody,
//             to: phone,
//             from: "+919866239168",
//         });
//         logger.info("authService.sendOtpService STOP")
//         return res.status(200).json({ otp: hashedOtp, message: "OTP has been sent successfully" });
//     } catch (error) {
//         console.error("Error sending OTP:", error);
//         return res.status(500).json({ error: "Failed to send OTP. Please try again later." });
//     }
// };

exports.sendEmailService = async (email, otpType, res) => {
    try {
        logger.info("authService.sendEmailService START");

        // Check user existence based on otpType
        let userExists = await getUserDetails(email);

        if (otpType === "EMAILVERIFICATION") {
            if (userExists) {
                logger.info("authService.sendEmailService END - EMAIL EXISTS");
                return res.status(409).json({ message: "Email already exists." });
            }
        } else if (otpType === "PASSWORDRESET") {
            if (!userExists) {
                logger.info("authService.sendEmailService END - USER NOT FOUND");
                return res.status(404).json({ message: "User not found." });
            }
        } else if (otpType === "2FA") {
            if (!userExists) {
                logger.info("authService.sendEmailService END - USER NOT FOUND");
                return res.status(404).json({ message: "User not found." });
            }
        }

        const existingRequest = await getPendingOTPRequest(email, otpType);

        // Allow resend logic
        if (existingRequest && otpType !== "EMAILVERIFICATION" && otpType !== "PASSWORDRESET") {
            logger.info("An OTP request is already in progress");
            return res.status(429).json({
                message: "An OTP request is already in progress. Please wait before requesting another.",
            });
        }


        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = generateTimeStampOTP();

        // Generate email content based on otpType

        const emailContents =
            otpType === "EMAILVERIFICATION"
                ? EmailVerification()
                : otpType === "PASSWORDRESET"
                    ? PasswordReset()
                    : otpType === "2FA"
                        ? TwoFactorAuthentication() : null;

        const user =
            otpType === "EMAILVERIFICATION"
                ? "user"
                : userExists.userName;

        const emailContent = generateHtmlTemplateOTP(
            user,
            emailContents.HEAD_1,
            emailContents.BODY_DIVIDER_1,
            emailContents.BODY_DIVIDER_2,
            email,
            otp
        );

        // Send email
        await sendMailForOTP(email, emailContent);


        // Handle OTP record
        const existingRecord = await getOTPRecord(email, otpType);

        if (existingRecord) {
            // Update existing record
            existingRecord.hashedOtp = hashedOtp;
            existingRecord.otpExpiry = otpExpiry;
            existingRecord.otpType = otpType;
            await existingRecord.save();
            logger.info("OTP record updated successfully");
        } else {
            // Create a new record
            const otpData = {
                email: email,
                hashedOtp: hashedOtp,
                otpExpiry: otpExpiry,
                isValidated: false,
                otpType: otpType
            };
            await insertOTP(otpData);
            logger.info("New OTP record created successfully");
        }

        logger.info("authService.sendEmailService END");
        return res.status(200).json({
            email: email,
            message: "Email with OTP has been sent successfully."
        });
    } catch (error) {
        logger.error("Error in sendEmailService:", error);
        return res.status(500).json({ error: "Failed to send email." });
    } finally {
        logger.info("authService.sendEmailService STOP");
    }
};

exports.validateOtpService = async (email, enteredOtp, otpType, res) => {
    try {
        logger.info("authService.validateOtpService START");

        const otpRecord = await getOTPRecord(email, otpType);
        if (!otpRecord) {
            logger.info("authService.validateOtpService END - OTP NOT FOUND");
            return res.status(404).json({ success: false, message: "OTP not found." });
        }

        // Check if OTP has expired
        if (Date.now() > otpRecord.otpExpiry) {
            logger.info("authService.validateOtpService END - OTP EXPIRED");
            return res.status(410).json({ success: false, message: "OTP has expired." });
        }

        // Verify OTP
        const isOtpValid = await bcrypt.compare(enteredOtp, otpRecord.hashedOtp);
        if (!isOtpValid) {
            logger.info("authService.validateOtpService END - INVALID OTP");
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        // Mark OTP as validated
        await updateOTPValidation(email, otpType);

        // Generate and return JWT token for 2FA
        if (otpType === "2FA") {
            const user = await getUserDetails(email);
            if (!user) {
                logger.info("authService.validateOtpService END - USER NOT FOUND");
                return res.status(404).json({ success: false, message: "User not found." });
            }

            const token = jwt.sign(
                { email: user.email, userName: user.userName, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            logger.info("authService.validateOtpService END - 2FA TOKEN GENERATED");
            return res.status(200).json({
                success: true,
                token: token,
                message: "OTP validated successfully. Use the token for further authentication.",
            });
        }

        // Default response for other OTP types
        logger.info("authService.validateOtpService END");
        return res.status(200).json({ success: true, message: "OTP validated successfully." });
    } catch (error) {
        logger.error("Error in validateOtpService:", error);
        return res.status(500).json({ error: "Failed to validate OTP." });
    }
};


exports.checkValidatedEmailSerivce = async (email, res) => {
    try {
        logger.info("authService.checkValidatedEmailSerivce START");
        const otpRecord = await getOTPRecord(email, "EMAILVERIFICATION");
        const userRecord = await getUserDetails(email);
        if (userRecord) {
            logger.info("authService.checkValidatedEmailSerivce END");
            return res.status(409).json({ success: true, message: "Email Already Exists" });
        }
        if (otpRecord && otpRecord.isValidated) {
            logger.info("authService.checkValidatedEmailSerivce END");
            return res.status(200).json({ success: true, message: "Email is Verified" });
        }
        logger.info("authService.checkValidatedEmailSerivce END - EMAIL NOT VERIFIED")
        return res.status(401).json({ success: false, message: "Email Not Verified" });
    }
    catch (error) {
        logger.error("Error in checkValidatedEmailSerivce:", error);
        return res.status(500).json({ error: error });
    }
}

exports.userSignupService = async (req, res) => {
    try {
        logger.info("authService.userSignupService START");
        const userFields = Object.keys(Users.schema.paths); // Extract schema fields
        const userData = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => userFields.includes(key))
        );

        const { emailExists, usernameExists } = await checkUserExistence(userData.email, userData.userName);

        if (emailExists) {
            logger.info("authService.userSignupService - EMAIL ALREADY EXISTS STOP");
            return res.status(400).json({ error: "Email is already registered." });
        }

        if (usernameExists) {
            logger.info("authService.userSignupService - USERNAME ALREADY EXISTS STOP");
            return res.status(400).json({ error: "Username is already taken." });
        }

        const emailValidationResult = await isEmailValidated(userData.email);
        if (!emailValidationResult.validated) {
            logger.info("authService.userSignupService - OTP ERROR STOP");
            return res.status(400).json({ error: emailValidationResult.reason });
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
        userData.confirmPassword = hashedPassword;

        userData.createdAt = generateTimeStamp();
        userData.updatedAt = generateTimeStamp();
        userData.isActive = true;

        await insertUser(userData);
        logger.info("authService.userSignupService STOP");
        return res.status(201).json({
            message: "User registered successfully",
        });
    }
    catch (error) {
        logger.error("Error in userSignupService:", error);
        return res.status(500).json({ error: error });
    }
}

exports.userSigninService = async (req, res) => {
    try {
        logger.info("authService.userSigninService START");

        const { userName, email, password } = req.body;

        // Validate input fields
        if (!userName && !email) {
            logger.info("authService.userSigninService - USERNAME OR EMAIL NOT PROVIDED STOP");
            return res.status(400).json({ error: "Either userName or email must be provided." });
        }

        if (!password) {
            logger.info("authService.userSigninService - PASSWORD NOT PROVIDED STOP");
            return res.status(400).json({ error: "Password is required." });
        }

        let user = null;
        if (email) {
            user = await getUserDetails(email.trim());
        } else if (userName) {
            user = await getUserDetailsUsername(userName.trim());
        }

        console.log(req.body);
        console.log(user);
        if (!user || user.isActive === false) {
            logger.info("authService.userSigninService - USER NOT FOUND OR INACTIVE STOP");
            return res.status(404).json({ error: "User not found or inactive." });
        }

        if ((email && email !== user.email) || (userName && userName !== user.userName)) {
            logger.info("authService.userSigninService - EMAIL OR USERNAME ERROR STOP");
            return res.status(401).json({ error: "Invalid email or username." });
        }        

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.info("authService.userSigninService - PASSWORD INVALID STOP");
            return res.status(401).json({ error: "Invalid password." });
        }

        // Check for 2FA
        if (user.is2FA) {
            logger.info("authService.userSigninService - 2FA");
            return res.status(202).json({
                message: "Please Verify that its you",
                email: user.email
            });
        }

        // Generate JWT token for non-2FA users
        const token = jwt.sign({ email: user.email, userName: user.userName, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        logger.info("authService.userSigninService STOP");
        return res.status(200).json({
            token: token,
            role: user.role,
            message: "User logged in successfully",
        });
    } catch (error) {
        logger.error("Error in userSigninService:", error);
        return res.status(500).json({ error: error.message });
    }
};

exports.changePasswordService = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const user = await getUserDetails(email);
        if (!user) {
            logger.info("authService.changePasswordService - USER NOT FOUND STOP");
            return res.status(404).json({ error: "User not found." });
        }
        // Check if new password and confirm password match
        if (password !== confirmPassword) {
            logger.info("authService.changePasswordService - PASSWORDS DO NOT MATCH STOP");
            return res.status(400).json({ error: "Passwords do not match." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const timeStamp = generateTimeStamp();
        // Update user password
        await updateUserPassword(email, hashedPassword, hashedPassword, timeStamp);
        logger.info("authService.changePasswordService STOP");
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        logger.error("Error in changePasswordService:", error);
        return res.status(500).json({ error: error.message });
    }
}