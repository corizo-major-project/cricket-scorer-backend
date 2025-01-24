//EMAILVERIFICATION
exports.EmailVerification = () => {
    return ({
        HEAD_1: "Verify your identity",
        HEAD_2: "Welcome to Score Liklo!",
        BODY_DIVIDER_1: "We noticed you're signing up with us using the email address",
        BODY_DIVIDER_2: ", and we’re excited to have you on board. To ensure your account's security, please verify your email address by entering the following One-Time Password (OTP) in the app:"
    })
}

//PASSWORDRESET
exports.PasswordReset = () => {
    return ({
        HEAD_1: "Reset your password",
        HEAD_2: "Welcome to Score Liklo!",
        BODY_DIVIDER_1: "We noticed you're resetting your password using the email address",
        BODY_DIVIDER_2: ", and we’re excited to have you on board. To ensure your account's security, please verify your email address by entering the following One-Time Password (OTP) in the app:"
    })  
}

//2FA
exports.TwoFactorAuthentication = () => {
    return ({
        HEAD_1: "Verify your identity",
        HEAD_2: "Welcome to Score Liklo!",
        BODY_DIVIDER_1: "We noticed you're signing in to Score Liklo and your email address",
        BODY_DIVIDER_2: ", and we’re excited to have you on board. To ensure your account's security, please verify your email address by entering the following One-Time Password (OTP) in the app:"
    })
}