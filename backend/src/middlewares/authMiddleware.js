const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_development_key';
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const token = authHeader.replace('Bearer ', '');
        const verifiedUser = jwt.verify(token, JWT_SECRET);
        req.user = verifiedUser; 
        next(); 
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};
module.exports = verifyToken;