const logger = require("../connectors/logger");
const nodemailer = require("nodemailer");

exports.sendMailForOTP = async (email, emailContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Replace with your email provider's SMTP server
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "sdpmswd@gmail.com", // Replace with your email
                pass: "efjo krha fnha xrol", // Replace with your email password or app password
            },
        });

        // Email options
        const mailOptions = {
            from: '"Score Liklo" sdpmswd@gmail.com', // Replace with sender's email and name
            to: email, // Recipient's email
            subject: "Your OTP for Score Liklo",
            html: emailContent, // HTML body with dynamic OTP
        };

        // Send email
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        logger.error("Error in sendEmailService:", error);
    }
}