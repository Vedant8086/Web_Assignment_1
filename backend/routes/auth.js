const express = require('express');
const router = express.Router();
const { register, login, updatePassword } = require('../controllers/userController');
const { registerValidation, loginValidation } = require('../utils/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.put('/update-password', authenticateToken, updatePassword);

module.exports = router;
