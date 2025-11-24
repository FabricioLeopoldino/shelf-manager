const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const LEAUTOTECH_JWT_SECRET = process.env.LEAUTOTECH_JWT_SECRET;

/**
 * Middleware to verify JWT token from LeautoTech Portal or internal token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  // Also check query parameter for token (for redirects from portal)
  const queryToken = req.query.token;
  const finalToken = token || queryToken;

  if (!finalToken) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  // Try to verify with LeautoTech JWT secret first
  jwt.verify(finalToken, LEAUTOTECH_JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
      return next();
    }

    // If LeautoTech token fails, try internal JWT secret
    jwt.verify(finalToken, JWT_SECRET, (err2, decoded2) => {
      if (err2) {
        return res.status(403).json({ 
          error: 'Invalid or expired token.' 
        });
      }

      req.user = decoded2;
      next();
    });
  });
};

/**
 * Generate internal JWT token
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify internal JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken
};
