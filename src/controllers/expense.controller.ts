import type { Request, Response } from 'express'
import Expense from '../models/expense.model';
import Budget from '../models/budget.model';

export class ExpensesController {
    static create = async (req: Request, res: Response) => {
        try {
            const { name, amount } = req.body;

            const expense = new Expense({name, amount});
            expense.budgetId = req.budget.id; //getting budget from middleware (ValidateBudgetExist)

            await expense.save();
        
            res.status(201).json(expense);
        } catch (error) {
            console.error("Error creating expense:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
  
    static getById = async (req: Request, res: Response) => {
        const expense = await Expense.findByPk(req.expense.id, {
            include: [{ model: Budget }] // Include related budget
        });
            
        res.status(201).json(expense);
    }

    static updateById = async (req: Request, res: Response) => {
        await req.expense.update(req.body);

        res.status(201).json({msg: 'Updated correctly'});
    }
  
    static deleteById = async (req: Request, res: Response) => {
        await req.expense.destroy();

        res.status(201).json({msg: 'Deleted correctly'});
    }
}