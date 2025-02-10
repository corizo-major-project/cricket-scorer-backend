// authHandler.js
exports.FAILED_TO_HANDLE_EMAIL_REQUEST = "Failed to handle email request";
exports.FAILED_TO_HANDLE_OTP_VALIDATION = "Failed to handle OTP validation";
exports.FAILED_TO_HANDLE_EMAIL_VALIDATION = "Failed to handle email validation";
exports.FAILED_TO_HANDLE_USER_SIGNUP = "Failed to handle user signup";
exports.FAILED_TO_HANDLE_USER_SIGIN = "Failed to handle user signin";
exports.FAILED_TO_HANDLE_CHANGE_PASSWORD = "Failed to handle change password";

//authService.js
exports.EMAIL_ALREADY_EXISTS = "Email already exists";
exports.USERNAME_ALREADY_EXISTS = "Username already exists";
exports.USER_NOT_FOUND = "User not found";
exports.FAILED_TO_SERVICE_EMAIL = "Failed to send email";
exports.OTP_NOT_FOUND = "OTP not found";
exports.OTP_HAS_EXPIRED = "OTP has expired";
exports.INVALID_OTP = "Invalid OTP";
exports.FAILED_TO_SERVICE_OTP_VALIDATION = "Failed to validate OTP";
exports.EMAIL_NOT_VERIFIED = "Email not verified";
exports.PLEASE_PROVIDE_REQUIRED_FIELDS = "Please provide all required fields";
exports.EMAIL_OR_USERNAME_ERROR = "Email or username error";
exports.INVALID_PASSWORD = "Invalid password";
exports.PASSWORDS_DO_NOT_MATCH = "Passwords do not match";

// matchHandler.js
exports.FAILED_TO_HANDLE_CREATE_MATCH = "Failed to create match"
exports.FAILED_TO_HANDLE_FETCH_MATCH = "Failed to fetch matches"

// matchService.js
exports.UNAUTHORIZED_USER = "Unauthorized user";
exports.INVALID_OVERS_SELECTED = "Invalid overs for the selected match type."
exports.TEAMS_DO_NOT_EXISTS = "One or both teams do not exist."
exports.DUPLICATE_PLAYERS_DETECTED = "Duplicate players detected across teams."
exports.PLAYERS_DO_NOT_EXIST = "One or more players do not exist in the database."
exports.MATCH_TIMINGS_CONFLICT_WITH_PLAYERS = "One or more players are already scheduled in another match at the same time."