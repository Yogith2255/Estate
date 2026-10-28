const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration is missing.',
      });
    } const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact administrator.`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication (attaches user if token present and valid, doesn't block if absent)
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        return res.status(500).json({
          success: false,
          message: 'Server authentication configuration is missing.',
        });
      } try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch (err) {
        // Silently proceed for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuthenticate };
