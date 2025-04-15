import { ExpensesController } from '../../../controllers/expense.controller';
import Expense from '../../../models/expense.model';
import { createRequest, createResponse } from 'node-mocks-http';
import { expenses } from '../../mocks/expenses';

jest.mock('../../../models/expense.model', () => ({
    create: jest.fn(),
    findByPk: jest.fn()
}))

describe('ExpensesController.create', () => {
    it('should create a new expense and return 201', async () => {
        const mockExpense = {
            save: jest.fn().mockResolvedValue(true)
        };

        (Expense.create as jest.Mock).mockResolvedValue(mockExpense);

        const request = createRequest({
            url: '/api/budgets/:budgetId/expenses',
            method: 'POST',
            body: {
                name: 'Comida',
                amount: 200
            },
            budget: {
                id: 1
            }
        });

        const response = createResponse();

        await ExpensesController.create(request, response);
        
        const data = response._getJSONData();

        expect(response.statusCode).toBe(201);
        expect(data).toEqual({msg: 'Expense created correctly'});
        expect(mockExpense.save).toHaveBeenCalled();
        expect(mockExpense.save).toHaveBeenCalledTimes(1);
        expect(Expense.create).toHaveBeenCalledWith(request.body);
    });

    it('should handle errors and return 500', async () => {
        const req = createRequest({
            url: '/api/budgets/:budgetId/expenses',
            method: 'POST',
            body: {
                name: 'Comida',
                amount: 200
            },
            budget: {
                id: 1
            }
        });

        const res = createResponse();

        (Expense.create as jest.Mock).mockRejectedValue('Error creating expense');

        await ExpensesController.create(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: "Internal server error" });
})});

describe('ExpensesController.getById', () => {
    it('should return an expense with id 1', async () => {
        const request = createRequest({
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            method: 'GET',
            expense: {
                id: 1
            }
        });
        const response = createResponse();

        (Expense.findByPk as jest.Mock).mockResolvedValue(expenses[0]);


        await ExpensesController.getById(request, response);
        
        const data = response._getJSONData();

        expect(response.statusCode).toBe(201);
        expect(data).toEqual(expenses[0]);
        expect(Expense.findByPk).toHaveBeenCalled();
    });
})  

describe('ExpensesController.updateById', () => {
    it('should update expense with id 1', async () => {
        const expenseMock = {
            update: jest.fn().mockResolvedValue(true)
        }

        const request = createRequest({
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            method: 'PATCH',
            expense: expenseMock,
            body:{
                name:'Example',
                amount: 2500
            }
        });
        const response = createResponse();

        await ExpensesController.updateById(request, response);
        
        const data = response._getJSONData();

        expect(response.statusCode).toBe(201);
        expect(data).toEqual({msg: 'Updated correctly'});
        expect(expenseMock.update).toHaveBeenCalled();
        expect(expenseMock.update).toHaveBeenCalledTimes(1);
    });
})  

describe('ExpensesController.deleteById', () => {
    it('should delete expense', async () => {
        const expenseMock = {
            destroy: jest.fn().mockResolvedValue(true)
        }

        const request = createRequest({
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            method: 'DELETE',
            expense: expenseMock
        });
        const response = createResponse();

        await ExpensesController.deleteById(request, response);
        
        const data = response._getJSONData();

        expect(response.statusCode).toBe(201);
        expect(data).toEqual({msg: 'Deleted correctly'});
        expect(expenseMock.destroy).toHaveBeenCalled();
        expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
    });
})  