// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.verifyToken = (req, res, next) => {
    if (req.path === "/api/auth/login" || req.path === "/api/auth/register/admin" || req.path === "/api/auth/register/organization") {
        return next();
    }

    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ message: "Access denied. No token provided." });
    }

    // Remove "Bearer " prefix if present
    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Invalid or expired token:', err);
            return res.status(403).send("Invalid or expired token.");
        }
        req.user = decoded; // Attach decoded payload to request object
        next(); // Proceed to the next middleware or route handler
    });
};