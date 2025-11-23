const jwt = require('jsonwebtoken');
const db = require('../db');
const { User } = db;

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(payload.userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        req.user = { 
            userId: payload.userId, 
            orgId: payload.orgId, 
            email: user.email, 
            name: user.name 
        }; 
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
        }
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = { authMiddleware };