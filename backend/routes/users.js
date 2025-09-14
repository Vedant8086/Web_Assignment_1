const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getAllUsers, 
  createUser, 
  updateProfile, 
  getDashboardStats 
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { registerValidation, loginValidation, updateProfileValidation } = require('../utils/validation');

// Debug logging
console.log('📋 User routes - Functions imported:', {
  register: typeof register,
  login: typeof login,
  getAllUsers: typeof getAllUsers,
  createUser: typeof createUser,
  updateProfile: typeof updateProfile,
  getDashboardStats: typeof getDashboardStats
});

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes (no role restriction for profile update)
router.get('/dashboard-stats', authenticateToken, getDashboardStats);
router.patch('/profile', authenticateToken, updateProfileValidation, updateProfile);

// Admin only routes
router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.post('/', authenticateToken, authorizeRoles('admin'), registerValidation, createUser);

module.exports = router;
