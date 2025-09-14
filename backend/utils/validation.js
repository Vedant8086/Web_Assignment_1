const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  body('role')
    .isIn(['user', 'store_owner'])
    .withMessage('Role must be either "user" or "store_owner"')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const storeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Store name is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters')
];

const ratingValidation = [
  body('storeId')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

module.exports = {
  registerValidation,
  loginValidation,
  storeValidation,
  ratingValidation
};
