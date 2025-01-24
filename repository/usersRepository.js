const logger = require('../connectors/logger');
const Users = require("../models/Users");

exports.getUserDetails = async (email) => {
    try {
        return await Users.findOne({ email });
    }
    catch (error) {
        logger.error('Error:', error);
    }
}

exports.getUserDetailsUsername = async (userName) => {
    try {
        return await Users.findOne({ userName });
    }
    catch(error) {
        logger.error('Error:', error);
    }
}

exports.checkUserExistence = async (email, username) => {
    try {
        const result = await Users.aggregate([
            {
                $match: {
                    $or: [{ email }, { userName: username }],
                },
            },
            {
                $project: {
                    emailExists: { $eq: ["$email", email] },
                    usernameExists: { $eq: ["$userName", username] },
                },
            },
        ]);

        if (result.length === 0) {
            return { emailExists: false, usernameExists: false };
        }

        return result[0]; 
    } catch (error) {
        logger.error("Error in checkUserExistence:", error);
        throw new Error("Failed to check user existence");
    }
};


exports.insertUser = async (userData) => {
    try {
        const user = new Users(userData);
        return await user.save();
    }
    catch (error) {
        logger.error("Error in insertUser:", error);
    }
}

exports.userLoginRepo = async (userName, email) => {
    try {
        const pipeline = [];

        // Dynamically build $match criteria
        const matchStage = {};
        if (typeof userName === 'string' && userName.trim()) {
            matchStage.userName = userName.trim();
        }
        if (typeof email === 'string' && email.trim()) {
            matchStage.email = email.trim();
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Add $project and $limit stages
        pipeline.push(
            {
                $project: {
                    _id: 1,
                    userName: 1,
                    email: 1,
                    password: 1,
                    role: 1,
                    is2FA: 1,
                    isActive: 1,
                },
            },
            { $limit: 1 }
        );

        return Users.aggregate(pipeline).then((results) => {
            return results[0] || null;
        });
    } catch (error) {
        logger.error('Error:', error);
        throw error;
    }
};

exports.updateUserPassword = async (email, password, confirmPassword, updatedAt) => {
    try {
        const result = await Users.findOneAndUpdate(
            { email }, 
            { 
                password: password, 
                confirmPassword: confirmPassword, 
                updatedAt: updatedAt 
            },
            { new: true } 
        );

        if (!result) {
            throw new Error("User not found or update failed");
        }

        return result; 
    } catch (err) {
        console.error("Error updating user password:", err);
        throw err; 
    }
};
