import express from 'express'
import { BudgetController } from '../controllers/budget.controller';
import { ExpensesController } from '../controllers/expense.controller';
import { handleInputErrors } from '../middleware/validation';
import { authorized, validateBudgetExist } from '../middleware/budget';
import {body, param} from 'express-validator'
import { belongsToBudget, validateExpenseExist } from '../middleware/expense';
import { authMiddleware } from '../middleware/authentication';

const router = express.Router();

router.use(authMiddleware);//in all requests

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

router.get('/:budgetId', 
    param('budgetId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    validateBudgetExist,
    authorized, //avoid manipulate other people budgets
    BudgetController.findById
);

router.patch('/:budgetId', 
    param('budgetId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    validateBudgetExist,
    authorized,
    BudgetController.updateBudget
);

router.delete('/:budgetId', 
    param('budgetId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    validateBudgetExist,
    authorized,
    BudgetController.deleteBudget
);

/**Expenses routes */
router.post('/:budgetId/expenses',
    validateBudgetExist,
    authorized,
    ExpensesController.create
);
router.get('/:budgetId/expenses/:expenseId', 
    param('budgetId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    param('expenseId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    validateExpenseExist,
    ExpensesController.getById
);

router.put('/:budgetId/expenses/:expenseId', 
    param('budgetId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    param('expenseId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    validateBudgetExist,
    validateExpenseExist,
    belongsToBudget,
    authorized,
    ExpensesController.updateById
);

router.delete('/:budgetId/expenses/:expenseId',
    param('budgetId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    param('expenseId')
    .isInt({ min: 1 }).withMessage('Id must be a number')
    .toInt(),
    handleInputErrors,
    validateBudgetExist,
    validateExpenseExist,
    belongsToBudget,
    authorized,
    ExpensesController.deleteById
);

export default router