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
const { OTP_TYPE_EMAIL_VERIFICATION, OTP_TYPE_PASSWORD_RESET, OTP_IN_PROGRESS, OTP_TYPE_2FA, USER_EMAIL, EMAIL_SENT_SUCCESSFULLY, OTO_VALIDATED_SUCCESSFULLY, EMAIL_VERIFIED_SUCCESSFULLY, USER_REGISTERED_SUCCESSFULLY, PLEASE_VERIFY_2FA, USER_LOGGED_IN_SUCCESSFULLY, PASSWORD_CHANGED_SUCCESSFULLY } = require("../constants/general");
const { EMAIL_ALREADY_EXISTS, USER_NOT_FOUND, FAILED_TO_SERVICE_EMAIL, OTP_NOT_FOUND, OTP_HAS_EXPIRED, INVALID_OTP, FAILED_TO_SERVICE_OTP_VALIDATION, EMAIL_NOT_VERIFIED, USERNAME_ALREADY_EXISTS, PLEASE_PROVIDE_REQUIRED_FIELDS, EMAIL_OR_USERNAME_ERROR, INVALID_PASSWORD, PASSWORDS_DO_NOT_MATCH } = require("../constants/errorConstants");

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

        if (otpType === OTP_TYPE_EMAIL_VERIFICATION) {
            if (userExists) {
                logger.info("authService.sendEmailService END - EMAIL EXISTS");
                return res.status(409).json({ message: EMAIL_ALREADY_EXISTS });
            }
        } else if (otpType === "PASSWORDRESET") {
            if (!userExists) {
                logger.info("authService.sendEmailService END - USER NOT FOUND");
                return res.status(404).json({ message: USER_NOT_FOUND });
            }
        } else if (otpType === "2FA") {
            if (!userExists) {
                logger.info("authService.sendEmailService END - USER NOT FOUND");
                return res.status(404).json({ message: USER_NOT_FOUND });
            }
        }

        const existingRequest = await getPendingOTPRequest(email, otpType);

        // Allow resend logic
        if (existingRequest && otpType !== OTP_TYPE_EMAIL_VERIFICATION && otpType !== OTP_TYPE_PASSWORD_RESET) {
            logger.info("An OTP request is already in progress");
            return res.status(429).json({
                message: OTP_IN_PROGRESS,
            });
        }


        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = generateTimeStampOTP();

        // Generate email content based on otpType

        const emailContents =
            otpType === OTP_TYPE_EMAIL_VERIFICATION
                ? EmailVerification()
                : otpType === OTP_TYPE_PASSWORD_RESET
                    ? PasswordReset()
                    : otpType === OTP_TYPE_2FA
                        ? TwoFactorAuthentication() : null;

        const user =
            otpType === OTP_TYPE_EMAIL_VERIFICATION
                ? USER_EMAIL
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
            message: EMAIL_SENT_SUCCESSFULLY
        });
    } catch (error) {
        logger.error("Error in sendEmailService:", error);
        return res.status(500).json({ error: FAILED_TO_SERVICE_EMAIL });
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
            return res.status(404).json({ success: false, message: OTP_NOT_FOUND });
        }

        // Check if OTP has expired
        if (Date.now() > otpRecord.otpExpiry) {
            logger.info("authService.validateOtpService END - OTP EXPIRED");
            return res.status(410).json({ success: false, message: OTP_HAS_EXPIRED });
        }

        // Verify OTP
        const isOtpValid = await bcrypt.compare(enteredOtp, otpRecord.hashedOtp);
        if (!isOtpValid) {
            logger.info("authService.validateOtpService END - INVALID OTP");
            return res.status(400).json({ success: false, message: INVALID_OTP });
        }

        // Mark OTP as validated
        await updateOTPValidation(email, otpType);

        // Generate and return JWT token for 2FA
        if (otpType === OTP_TYPE_2FA) {
            const user = await getUserDetails(email);
            if (!user) {
                logger.info("authService.validateOtpService END - USER NOT FOUND");
                return res.status(404).json({ success: false, message: USER_NOT_FOUND });
            }
            const userPayload = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            };

            const token = jwt.sign(
                { email: user.email, userName: user.userName, role: user.role, user: userPayload },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            logger.info("authService.validateOtpService END - 2FA TOKEN GENERATED");
            return res.status(200).json({
                success: true,
                token: token,
                message: OTO_VALIDATED_SUCCESSFULLY,
            });
        }

        // Default response for other OTP types
        logger.info("authService.validateOtpService END");
        return res.status(200).json({ success: true, message: OTO_VALIDATED_SUCCESSFULLY });
    } catch (error) {
        logger.error("Error in validateOtpService:", error);
        return res.status(500).json({ error: FAILED_TO_SERVICE_OTP_VALIDATION });
    }
};


exports.checkValidatedEmailSerivce = async (email, res) => {
    try {
        logger.info("authService.checkValidatedEmailSerivce START");
        const otpRecord = await getOTPRecord(email, OTP_TYPE_EMAIL_VERIFICATION);
        const userRecord = await getUserDetails(email);
        if (userRecord) {
            logger.info("authService.checkValidatedEmailSerivce END");
            return res.status(409).json({ success: true, message: EMAIL_ALREADY_EXISTS });
        }
        if (otpRecord && otpRecord.isValidated) {
            logger.info("authService.checkValidatedEmailSerivce END");
            return res.status(200).json({ success: true, message: EMAIL_VERIFIED_SUCCESSFULLY });
        }
        logger.info("authService.checkValidatedEmailSerivce END - EMAIL NOT VERIFIED")
        return res.status(401).json({ success: false, message: EMAIL_NOT_VERIFIED });
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
            return res.status(400).json({ error: EMAIL_ALREADY_EXISTS });
        }

        if (usernameExists) {
            logger.info("authService.userSignupService - USERNAME ALREADY EXISTS STOP");
            return res.status(400).json({ error: USERNAME_ALREADY_EXISTS });
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
            message: USER_REGISTERED_SUCCESSFULLY,
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
            return res.status(400).json({ error: PLEASE_PROVIDE_REQUIRED_FIELDS });
        }

        if (!password) {
            logger.info("authService.userSigninService - PASSWORD NOT PROVIDED STOP");
            return res.status(400).json({ error: PLEASE_PROVIDE_REQUIRED_FIELDS });
        }

        let user = null;
        if (email) {
            user = await getUserDetails(email.trim());
        } else if (userName) {
            user = await getUserDetailsUsername(userName.trim());
        }

        if (!user || user.isActive === false) {
            logger.info("authService.userSigninService - USER NOT FOUND OR INACTIVE STOP");
            return res.status(404).json({ error: USER_NOT_FOUND });
        }

        if ((email && email !== user.email) || (userName && userName !== user.userName)) {
            logger.info("authService.userSigninService - EMAIL OR USERNAME ERROR STOP");
            return res.status(401).json({ error: EMAIL_OR_USERNAME_ERROR });
        }        

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.info("authService.userSigninService - PASSWORD INVALID STOP");
            return res.status(401).json({ error: INVALID_PASSWORD });
        }

        // Check for 2FA
        if (user.is2FA) {
            logger.info("authService.userSigninService - 2FA");
            return res.status(202).json({
                message: PLEASE_VERIFY_2FA,
                email: user.email
            });
        }

        const userPayload = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt
        };

        // Generate JWT token for non-2FA users
        const token = jwt.sign({ email: user.email, userName: user.userName, role: user.role, user: userPayload }, process.env.JWT_SECRET, {
            expiresIn: "8h",
        });

        logger.info("authService.userSigninService STOP");
        return res.status(200).json({
            token: token,
            role: user.role,
            message: USER_LOGGED_IN_SUCCESSFULLY,
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
            return res.status(404).json({ error: USER_NOT_FOUND });
        }
        // Check if new password and confirm password match
        if (password !== confirmPassword) {
            logger.info("authService.changePasswordService - PASSWORDS DO NOT MATCH STOP");
            return res.status(400).json({ error: PASSWORDS_DO_NOT_MATCH });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const timeStamp = generateTimeStamp();
        // Update user password
        await updateUserPassword(email, hashedPassword, hashedPassword, timeStamp);
        logger.info("authService.changePasswordService STOP");
        return res.status(200).json({ message: PASSWORD_CHANGED_SUCCESSFULLY });
    } catch (error) {
        logger.error("Error in changePasswordService:", error);
        return res.status(500).json({ error: error.message });
    }
}