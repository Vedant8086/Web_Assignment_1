const express = require('express');
const router = express.Router();
const { 
  getAllStores, 
  createStore, 
  createStoreForOwner, 
  getStoresByOwner, 
  getStoreRatings,
  updateStoreByOwner 
} = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { storeValidation, updateStoreValidation } = require('../utils/validation');

// Get all stores (for users and admins)
router.get('/', authenticateToken, getAllStores);

// Create store (Admin can create for any owner)
router.post('/', authenticateToken, authorizeRoles('admin'), storeValidation, createStore);

// Store owners can create their own stores
router.post('/create-own', authenticateToken, authorizeRoles('store_owner'), storeValidation, createStoreForOwner);

// Get stores owned by current user
router.get('/my-stores', authenticateToken, authorizeRoles('store_owner'), getStoresByOwner);

// Get ratings for a specific store (owner only)
router.get('/:storeId/ratings', authenticateToken, authorizeRoles('store_owner'), getStoreRatings);

// Store owner can update their own store - THIS WAS THE PROBLEMATIC LINE
router.patch('/:id/update', authenticateToken, authorizeRoles('store_owner'), updateStoreValidation, updateStoreByOwner);

module.exports = router;
