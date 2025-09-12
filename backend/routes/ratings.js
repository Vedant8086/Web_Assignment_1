const express = require('express');
const router = express.Router();
const { submitRating, getUserRatings } = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { ratingValidation } = require('../utils/validation');

router.post('/', authenticateToken, authorizeRoles('user'), ratingValidation, submitRating);
router.get('/my-ratings', authenticateToken, authorizeRoles('user'), getUserRatings);

module.exports = router;
