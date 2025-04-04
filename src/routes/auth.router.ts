import express from 'express'
import { AuthController } from '../controllers/auth.controller';
import { handleInputErrors } from '../middleware/validation';
import {body, param} from 'express-validator'

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

export default router