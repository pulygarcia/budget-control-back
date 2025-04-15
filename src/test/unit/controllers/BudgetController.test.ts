import {createRequest, createResponse} from 'node-mocks-http'
import { BudgetController } from '../../../controllers/budget.controller';
import Budget from '../../../models/budget.model';
import Expense from '../../../models/expense.model';
import { mockBudgets } from '../../mocks/budgets';

jest.mock('../../../models/budget.model', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
}))

describe('BudgetContoller.getAll', () => {
    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updatedBudgets = mockBudgets.filter(budget => budget.userId === options.where.userId);
            return Promise.resolve(updatedBudgets);
        });
    })

    it('should return 2 budgets for user with id 1', async () => {
        
        const request = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 1 } // Simulate authentication
        });
    
        const response = createResponse();
    
        await BudgetController.getAll(request, response);
    
        const data = response._getJSONData(); // get result
        //console.log(data); // real content
    
        expect(data).toHaveLength(2);
        expect(response.statusCode).toBe(200);
    })

    it('should return 1 budgets for user with id 2', async () => {
        
        const request = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 2 } // Simulate authentication
        });
    
        const response = createResponse();
    
        await BudgetController.getAll(request, response);
    
        const data = response._getJSONData(); // get result
        //console.log(data); // real content
    
        expect(data).toHaveLength(1);
        expect(response.statusCode).toBe(200);
    })

    it('should return 0 budgets for user with id 99', async () => {
        
        const request = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 99 } // Simulate authentication
        });
    
        const response = createResponse();
    
        await BudgetController.getAll(request, response);
    
        const data = response._getJSONData(); // get result
    
        expect(data).toHaveLength(0);
        expect(response.statusCode).toBe(200);
    })

    it('should handle error when fetching budgets', async () => {
        const request = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 99 } // Simulate authentication
        });

        const response = createResponse();
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error); //force return error
        await BudgetController.getAll(request, response);

        expect(response.statusCode).toBe(500);
        expect(response._getJSONData()).toEqual({error:"Error getting budgets"})
    })
})

describe('BudgetContoller.create', () => {
    it('should create a budget successfully', async () => {  
        //mock the save function
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true) //we expect to save budget correctly
        };

        (Budget.create as jest.Mock).mockResolvedValue(mockBudget);

        const request = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 }, // Simulate authentication,
            body:{
                name:"asado",
                amount: 92000,
                userId: 1
            }
        });
        const response = createResponse();
        
        await BudgetController.create(request, response);

        const data = response._getJSONData();

        expect(response.statusCode).toBe(201);
        expect(data).toBe('Budget created correctly');
        expect(mockBudget.save).toHaveBeenCalled();
        expect(mockBudget.save).toHaveBeenCalledTimes(1);
        expect(Budget.create).toHaveBeenCalledWith(request.body);
    })

    it('should handle error when creating budget', async () => {  
        const mockBudget = {
            save: jest.fn()
        };

        (Budget.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const request = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body:{
                name:"asado",
                amount: 92000,
                userId: 1
            }
        });
        const response = createResponse();
        
        await BudgetController.create(request, response);

        const data = response._getJSONData();
        
        expect(response.statusCode).toBe(500);
        expect(data).toEqual({ error: 'Error creating budget' });
        expect(Budget.create).toHaveBeenCalledWith(request.body);
        expect(mockBudget.save).not.toHaveBeenCalled(); //make sure that this is not arriving to .save() (because go direct to the catch)
    })
})

describe('BudgetController.findById', () => {
    (Budget.findByPk as jest.Mock).mockImplementation((id) => {
        const budget = mockBudgets.filter(b => b.id === id)[0];
        return Promise.resolve(budget);
    });

    it('should return a budget with id 1 and related expenses which are 3', async () => {
        const request = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: { id: 1 }
        });

        const response = createResponse();

        await BudgetController.findById(request, response);

        const data = response._getJSONData();
        
        expect(response.statusCode).toBe(201);
        expect(data.expenses).toHaveLength(3);
        expect(Budget.findByPk).toHaveBeenCalled();
        expect(Budget.findByPk).toHaveBeenCalledWith(request.budget.id, {
            include: [{ model: Expense }]
        });
    });

    it('should handle error getting budget by its id', async () => {
        const mockBudget = {
            findByPk: jest.fn()
        };

        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error('Server error'));

        const request = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: { id: 1 }
        });

        const response = createResponse();

        await BudgetController.findById(request, response);

        const data = response._getJSONData();

        expect(response.statusCode).toBe(500);
        expect(data).toEqual({error: "Error getting budget"});
        expect(mockBudget.findByPk).not.toHaveBeenCalled()
        expect(Budget.findByPk).toHaveBeenCalledWith(1, {
            include: [{ model: Expense }]
        });
    });
});

describe('BudgetController.updateBudget', () => {
    const mockBudget = {
        update: jest.fn().mockResolvedValue(true)
    };

    it('should update budget', async () => {
        const request = createRequest({
            method: 'PATCH',
            url: '/api/budgets/:id',
            budget: mockBudget,
            body: {name: 'example', amount:12121}
        });

        const response = createResponse();

        await BudgetController.updateBudget(request, response);

        const data = response._getJSONData();
        
        expect(data).toEqual({ msg: 'Budget has been updated' });
        expect(response.statusCode).toBe(201);
        expect(mockBudget.update).toHaveBeenCalled();
        expect(mockBudget.update).toHaveBeenCalledWith(request.body);
    })

    it('should handle error updating budget', async () => {
        const mockBudgetWithError = {
            update: jest.fn().mockRejectedValue(new Error('Update failed'))
        };

        const request = createRequest({
            method: 'PATCH',
            url: '/api/budgets/:id',
            budget: mockBudgetWithError,
            body: {name: 'example', amount:12121}
        });

        const response = createResponse();

        await BudgetController.updateBudget(request, response);

        const data = response._getJSONData();
        
        expect(mockBudgetWithError.update).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(data).toEqual({ error: 'Error updating budget' });
        expect(mockBudgetWithError.update).toHaveBeenCalledWith(request.body);
        expect(mockBudgetWithError.update).toHaveBeenCalledTimes(1);
    })
})

describe('BudgetController.deleteBudget', () => {
    const mockBudget = {
        destroy: jest.fn().mockResolvedValue(true)
    };

    it('should update budget', async () => {
        const request = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:id',
            budget: mockBudget,
        });

        const response = createResponse();

        await BudgetController.deleteBudget(request, response);

        const data = response._getJSONData();
        
        expect(data).toEqual({ msg: 'Budget has been deleted'});
        expect(response.statusCode).toBe(201);
        expect(mockBudget.destroy).toHaveBeenCalled();
    })

    it('should handle error deleting budget', async () => {
        const mockBudgetWithError = {
            destroy: jest.fn().mockRejectedValue(new Error('Delete failed'))
        };

        const request = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:id',
            budget: mockBudgetWithError,
        });

        const response = createResponse();

        await BudgetController.deleteBudget(request, response);

        const data = response._getJSONData();
        
        expect(mockBudgetWithError.destroy).toHaveBeenCalled();
        expect(mockBudgetWithError.destroy).toHaveBeenCalledTimes(1);
        expect(response.statusCode).toBe(500);
        expect(data).toEqual({ error: 'Error deleting budget' });
    })
})