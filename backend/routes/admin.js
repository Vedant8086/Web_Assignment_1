const express = require('express');
const router = express.Router();
const { 
  updateUser, 
  updateStore, 
  deleteUser, 
  deleteStore 
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { updateUserValidation, updateStoreValidation } = require('../utils/validation');

// Debug logging (remove after fixing)
console.log('🔍 Admin Routes - Imported functions:');
console.log('updateUser:', typeof updateUser);
console.log('updateStore:', typeof updateStore);
console.log('deleteUser:', typeof deleteUser);
console.log('deleteStore:', typeof deleteStore);

// Admin update routes
router.patch('/users/:id', authenticateToken, authorizeRoles('admin'), updateUserValidation, updateUser);
router.patch('/stores/:id', authenticateToken, authorizeRoles('admin'), updateStoreValidation, updateStore);

// Admin delete routes
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), deleteUser);
router.delete('/stores/:id', authenticateToken, authorizeRoles('admin'), deleteStore);

module.exports = router;
