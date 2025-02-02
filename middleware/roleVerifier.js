const roleVerifier = (allowedRoles) => (req, res, next) => {
    const { role } = req.user; 

    if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Access Denied. Insufficient Permissions.' });
    }

    next(); 
};

module.exports = roleVerifier;
