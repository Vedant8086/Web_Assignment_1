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
    .isIn(['user', 'store_owner', 'admin'])
    .withMessage('Role must be user, store_owner, or admin')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// UPDATED: Profile update validation (allow name, email, address, password but NOT role)
const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  body('password')
    .optional()
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  // Explicitly reject role updates
  body('role')
    .not()
    .exists()
    .withMessage('Role updates are not allowed through profile endpoint')
];

// Admin validation (full update allowed including role)
const updateUserValidation = [
  body('name')
    .optional()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner')
];

const updateStoreValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Store name cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  body('owner_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a valid number')
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
  updateProfileValidation,
  updateUserValidation,
  updateStoreValidation,
  storeValidation,
  ratingValidation
};
