const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Authenticate token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    console.log('🔑 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔑 Token decoded for user ID:', decoded.id);
    
    // Get user from database
    const user = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (user.rows.length === 0) {
      console.log('❌ User not found for token');
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    req.user = user.rows[0];
    console.log('👤 Authenticated user:', req.user.email, 'Role:', req.user.role);
    next();
    
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token format' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Authorize roles middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('🛡️  Checking role authorization...');
    console.log('🛡️  User role:', req.user?.role);
    console.log('🛡️  Required roles:', roles);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Access denied - insufficient permissions');
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    console.log('✅ Role authorization passed');
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
