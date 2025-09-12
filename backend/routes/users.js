const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, getDashboardStats } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { registerValidation } = require('../utils/validation');

router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.post('/', authenticateToken, authorizeRoles('admin'), registerValidation, createUser);
router.get('/dashboard-stats', authenticateToken, authorizeRoles('admin'), getDashboardStats);

module.exports = router;
