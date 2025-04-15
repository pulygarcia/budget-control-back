import {createRequest, createResponse} from 'node-mocks-http'
import { validateExpenseExist } from '../../../middleware/expense';
import Expense from '../../../models/expense.model';
import { expenses } from '../../mocks/expenses';
import { authorized } from '../../../middleware/budget';
import { mockBudgets } from '../../mocks/budgets';

jest.mock('../../../models/expense.model', () => ({
    findByPk: jest.fn(),
}))

describe('validate expense exist - Middleware', () => {
    it('should handle unexistant budget with id 4', async () => {
        const next = jest.fn();

        (Expense.findByPk as jest.Mock).mockResolvedValue(null);

        const request = createRequest({
            params: {
                expenseId: 4
            } 
        });

        const response = createResponse();

        await validateExpenseExist(request, response, next);

        const data = response._getJSONData();
        
        expect(response.statusCode).toBe(404);
        expect(data).toEqual({ error: `Expense with id ${request.params.expenseId} not found` });
        expect(next).not.toHaveBeenCalled();
    })

    it('should handle existant expense with id 1', async () => {
        const next = jest.fn();

        (Expense.findByPk as jest.Mock).mockResolvedValue(expenses[0]);

        const request = createRequest({
            params: {
                expenseId: 1
            } 
        });

        const response = createResponse();

        await validateExpenseExist(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(request.expense).toEqual(expenses[0]);
    })

    it('should handle internal server error', async () => {
        const next = jest.fn();

        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error("DB Error"));
    
        const request = createRequest({
            params: {
                expenseId: 2
            } 
        });
    
        const response = createResponse();
    
        await validateExpenseExist(request, response, next);
    
        const data = response._getJSONData();
    
        expect(response.statusCode).toBe(500);
        expect(data).toEqual({ error: 'Has been an error' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should avoid unauthorized user to create an expense', () => {
        const next = jest.fn();

        const request = createRequest({
            url:'/api/budgets/:budgetId/expenses',
            method: 'POST',
            budget: mockBudgets[0],
            user:{
                id: 2
            },
            body:{
                name:'example',
                amount:2300
            }
        });
    
        const response = createResponse();
    
        authorized(request, response, next);
    
        const data = response._getJSONData();
    
        expect(response.statusCode).toBe(401);
        expect(data).toEqual({msg: `Unauthorized`});
        expect(next).not.toHaveBeenCalled();
    });
});