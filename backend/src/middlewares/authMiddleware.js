// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// This must match the secret key you used in server.js!
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_development_key';

const verifyToken = (req, res, next) => {
    // 1. Look for the token in the request headers
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // 2. The header usually looks like "Bearer eyJhbGci...", so we strip out "Bearer "
        const token = authHeader.replace('Bearer ', '');

        // 3. Verify the token using your secret key
        const verifiedUser = jwt.verify(token, JWT_SECRET);
        
        // 4. Attach the decoded user data (like userId and role) to the request
        req.user = verifiedUser; 
        
        // 5. Allow the request to proceed to the actual route
        next(); 
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;