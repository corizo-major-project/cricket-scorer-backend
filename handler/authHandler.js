const { generateTimeStamp } = require("../util/dateAndTimeUtil");
const logger = require("../connectors/logger");
const { SEND_OTP, SEND_MAIL, VALIDATE_OTP, CHECK_VALIDATED_EMAIL, USER_SIGNUP, USER_SIGNIN, CHANGE_PASSWORD } = require("../constants/eventConstants");
const { insertEvent } = require("../repository/eventRepository");
const authService = require("../service/authService");
const Users = require("../models/Users");

exports.sendOtpHandler = async (phone, request, res) => {
    logger.info("authHandler.sendOtpHandler START");
    try {
        const event = {
            eventType: SEND_OTP,
            userName: "",
            URL: request.url,
            ipAddress: [request.ip],
            httpMethod: request.method,
            requestPayload: "", // Populate if needed
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return authService.sendOtpService(phone, res);
    } catch (error) {
        logger.error("Error in sendOtpHandler:", error);
        return res.status(500).json({ error: "Failed to handle OTP request" });
    } finally {
        logger.info("authHandler.sendOtpHandler STOP");
    }
};

exports.sendEmailHandler = async (email, otpType, req, res) => {
    logger.info("authHandler.sendEmailHandler START");
    try {
        const event = {
            eventType: SEND_MAIL,
            userName: "",
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: "", // Populate if needed
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return authService.sendEmailService(email, otpType, res);
    } catch (error) {
        logger.error("Error in sendEmailHandler:", error);
        return res.status(500).json({ error: "Failed to handle email request" });
    } finally {
        logger.info("authHandler.sendEmailHandler STOP");
    }
};

exports.validateOtpHandler = async (email, otp, otpType, req, res) => {
    logger.info("authHandler.validateOtpHandler START");
    try {
        const event = {
            eventType: VALIDATE_OTP,
            userName: "",
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: "", // Populate if needed
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return authService.validateOtpService(email, otp, otpType, res);
    } catch (error) {
        logger.error("Error in validateOtpHandler:", error);
        return res.status(500).json({ error: "Failed to handle OTP validation" });
    } finally {
        logger.info("authHandler.validateOtpHandler STOP");
    }
}

exports.checkValidatedEmailHandler = async (email, req, res) => {
    logger.info("authHandler.checkValidatedEmailHandler START");
    try {
        const event = {
            eventType: CHECK_VALIDATED_EMAIL,
            userName: "",
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: "", // Populate if needed
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return authService.checkValidatedEmailSerivce(email, res);
    }
    catch (error) {
        logger.error("Error in checkValidatedEmailHandler:", error);
        return res.status(500).json({ error: "Failed to handle OTP validation" });
    } finally {
        logger.info("authHandler.checkValidatedEmailHandler STOP");
    }
}

exports.userSignupHandler = async (req, res) => {
    logger.info("authHandler.userSignupHandler START");
    try {
        const event = {
            eventType: USER_SIGNUP,
            userName: req.body.userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return authService.userSignupService(req, res);
    }
    catch (error) {
        logger.error("Error in userSignupHanlder:", error);
        return res.status(500).json({ error: "Failed to user signup" });
    } finally {
        logger.info("authHandler.userSignupHandler STOP");
    }
}

exports.userSigninHandler = async (req, res) => {
    logger.info("authHandler.userSigninHandler START");
    try {
        const event = {
            eventType: USER_SIGNIN,
            userName: req.body.userName,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp(),
        };
        await insertEvent(event);
        return authService.userSigninService(req, res);
    }
    catch (error) {
        logger.error("Error in userSigninHandler:", error);
        return res.status(500).json({ error: "Failed to user signin" });
    } finally {
        logger.info("authHandler.userSigninHandler STOP");
    }
}

exports.changePasswordHandler = async (req, res) => {
    logger.info("authHandler.changePasswordHandler START");
    try {
        const event = {
            eventType: CHANGE_PASSWORD,
            userName: req.body.email,
            URL: req.url,
            ipAddress: [req.ip],
            httpMethod: req.method,
            requestPayload: JSON.stringify(req.body),
            createdAt: generateTimeStamp()
        };
        await insertEvent(event);
        return authService.changePasswordService(req, res);
    }
    catch(err) {
        logger.error("Error in changePasswordHandler:", error);
        return res.status(500).json({ error: "Failed to change Password" });
    }
    finally {
        logger.info("authHandler.changePasswordHandler STOP")
    }
}