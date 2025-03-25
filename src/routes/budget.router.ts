import express from 'express'
import { BudgetController } from '../controllers/budget.controller';
import { handleInputErrors } from '../middleware/validation';
import {body} from 'express-validator'

const router = express.Router();

router.get('/', 
    BudgetController.getAll
);

router.post(
    '/',
    body('name')
        .isString().withMessage('Invalid name')
        .notEmpty().withMessage('Name cannot be empty').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('amount')
        .isNumeric().withMessage('Amount must be a number')
        .isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    handleInputErrors,
    BudgetController.create
);

export default router