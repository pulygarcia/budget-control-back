import express from 'express'
import { AuthController } from '../controllers/auth.controller';
import { handleInputErrors } from '../middleware/validation';
import {body, param} from 'express-validator'
import { limiter } from '../config/limiter';
import { authMiddleware } from '../middleware/authentication';

const router = express.Router();


router.post('/register', 
  body('username')
    .trim()
    .isString().withMessage('Name must be a text.')
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long.'),
  
  body('email')
    .trim()
    .isEmail().withMessage('Must provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .isString().withMessage('Password must be a text.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter.'),

  handleInputErrors,
  AuthController.register
);

router.post('/verify', 
  body('token')
  .matches(/^\d{6}$/).withMessage('Token must be a 6-digit number.'),
  handleInputErrors,
  limiter,
  AuthController.verify
);

router.post('/login', 
  body('email')
    .trim()
    .isEmail().withMessage('Must provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password field cannot be empty.'),
  handleInputErrors,
  limiter,
  AuthController.login
);

router.post('/forgot-password',
  body('email')
    .trim()
    .isEmail().withMessage('Must provide a valid email address.')
    .normalizeEmail(),
  limiter,
  AuthController.forgotPassword
);

router.post('/validate-token',
  body('token')
    .matches(/^\d{6}$/).withMessage('Token must be a 6-digit number.'),
  limiter,
  AuthController.validateToken
);

router.post('/reset-password/:token',
  param('token')
    .matches(/^\d{6}$/).withMessage('Token must be a 6-digit number.'),
  body('newPassword')
    .isString().withMessage('Password must be a text.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter.'),
  limiter,
  AuthController.resetPasswordWithToken
);

router.post('/change-password',
  body('current_password')
    .isString().withMessage('Current password must be a text.')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .isString().withMessage('Password must be a text.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter.')
    .custom((value, { req }) => {
      if (value === req.body.current_password) {
        throw new Error('New password must be different from the current password.');
      }
      return true;
    }),

  limiter,
  AuthController.changePassword
);

router.get('/user',
  authMiddleware,
  AuthController.user
);

router.post('/valid-password',
  body('password')
    .notEmpty().withMessage('Password cannot be empty.')
    .isString().withMessage('Password must be a text.'),
  authMiddleware,
  AuthController.validPassword
);

export default router