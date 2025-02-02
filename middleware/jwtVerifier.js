const jwt = require('jsonwebtoken');
const Users = require('../models/Users');

const jwtVerifier = async (req, res, next) => {
    const authHeader = req.header('Authorization'); 

    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. Invalid Token Format.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await Users.findOne({ email: decoded.email, userName: decoded.userName });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Access Denied.' });
        }

        req.user = {
            email: user.email,
            userName: user.userName,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please log in again.' });
        }
        console.error('Error verifying token:', error);
        return res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = jwtVerifier;
