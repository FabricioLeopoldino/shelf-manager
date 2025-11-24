const express = require('express');
const router = express.Router();
const { authenticateToken, generateToken, verifyToken } = require('../middleware/auth');

/**
 * POST /api/auth/verify
 * Verify JWT token from LeautoTech Portal
 */
router.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.json({ 
    valid: true, 
    user: decoded 
  });
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({ 
    user: req.user 
  });
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateToken, (req, res) => {
  const newToken = generateToken({ 
    email: req.user.email 
  });

  res.json({ 
    token: newToken 
  });
});

module.exports = router;
