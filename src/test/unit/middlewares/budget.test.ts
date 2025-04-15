import {createRequest, createResponse} from 'node-mocks-http'
import { authorized, validateBudgetExist } from '../../../middleware/budget';
import Budget from '../../../models/budget.model';
import { mockBudgets } from '../../mocks/budgets';

jest.mock('../../../models/budget.model', () => ({
    findByPk: jest.fn(),
}))

describe('validate Budget exist - Middleware', () => {
    const next = jest.fn();

    it('should handle unexistant budget', async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(null);

        const request = createRequest({
            params: {
                budgetId: 1
            }
        });

        const response = createResponse();

        await validateBudgetExist(request, response, next);

        const data = response._getJSONData();
        
        expect(response.statusCode).toBe(404);
        expect(data).toEqual({ error: `Budget with id ${request.params.budgetId} not found` });
        expect(next).not.toHaveBeenCalled();
    })

    it('should execute next function before budget exists', async () => {
        const next = jest.fn();

        (Budget.findByPk as jest.Mock).mockResolvedValue(mockBudgets[0]);

        const request = createRequest({
            params: {
                budgetId: 1
            }
        });

        const response = createResponse();

        await validateBudgetExist(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(request.budget).toEqual(mockBudgets[0]); //we expect the function to assign budget to req
    })

    it('should return 500 if an error occurs', async () => {
        const next = jest.fn();

        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));

        const request = createRequest({
            params: {
                budgetId: 1
            }
        });
        const response = createResponse();

        await validateBudgetExist(request, response, next);

        const data = response._getJSONData();

        expect(response.statusCode).toBe(500);
        expect(data).toEqual({ error: `Has been an error` });
        expect(next).not.toHaveBeenCalled();
    });
})

describe('authorized - Middleware', () => {
    const next = jest.fn();

    it('should allow user and execute next function', async () => {
        const request = createRequest({
            budget: mockBudgets[0],
            user:{
                id: 1
            }
        });

        const response = createResponse();

        await authorized(request, response, next);
        
        expect(next).toHaveBeenCalled();
    })

    it('should handle error when user is not authorized', async () => {
        const next = jest.fn();

        const request = createRequest({
            budget: mockBudgets[0],
            user:{
                id: 2
            }
        });

        const response = createResponse();
        
        await authorized(request, response, next);
        const data = response._getJSONData();
        
        expect(response.statusCode).toBe(401);
        expect(data).toEqual({ msg: 'Unauthorized' });
        expect(next).not.toHaveBeenCalled();
    })
})