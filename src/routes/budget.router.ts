import express from 'express'
import { BudgetController } from '../controllers/budget.controller';
import { handleInputErrors } from '../middleware/validation';
import { valiadateHandleExist } from '../middleware/budget';
import {body, param} from 'express-validator'

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

router.get('/:id', 
    param('id')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    valiadateHandleExist,
    BudgetController.findById
);

router.patch('/:id', 
    param('id')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    valiadateHandleExist,
    BudgetController.updateBudget
);

router.delete('/:id', 
    param('id')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    valiadateHandleExist,
    BudgetController.deleteBudget
);

export default router