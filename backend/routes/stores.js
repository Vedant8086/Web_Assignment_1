const express = require('express');
const router = express.Router();
const { getAllStores, createStore, getStoresByOwner, getStoreRatings } = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { storeValidation } = require('../utils/validation');

router.get('/', authenticateToken, getAllStores);
router.post('/', authenticateToken, authorizeRoles('admin'), storeValidation, createStore);
router.get('/my-stores', authenticateToken, authorizeRoles('store_owner'), getStoresByOwner);
router.get('/:storeId/ratings', authenticateToken, authorizeRoles('store_owner'), getStoreRatings);

module.exports = router;
