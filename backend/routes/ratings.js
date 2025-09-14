const express = require('express');
const router = express.Router();
const { 
  submitRating, 
  getUserRatings, 
  getAllRatings, 
  deleteRating 
} = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { ratingValidation } = require('../utils/validation');

// Debug logging
console.log('📋 Rating routes - Functions imported:', {
  submitRating: typeof submitRating,
  getUserRatings: typeof getUserRatings,
  getAllRatings: typeof getAllRatings,
  deleteRating: typeof deleteRating
});

// Submit or update rating (users only)
router.post('/', authenticateToken, authorizeRoles('user'), ratingValidation, submitRating);

// Get user's own ratings - FIXED: Remove role restriction
router.get('/my-ratings', authenticateToken, getUserRatings);

// Get all ratings (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), getAllRatings);

// Delete rating
router.delete('/:id', authenticateToken, deleteRating);

module.exports = router;
