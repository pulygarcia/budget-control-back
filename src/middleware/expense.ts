import { Request, Response, NextFunction } from "express"
import Expense from "../models/expense.model";

declare global {
    namespace Express {
      interface Request {
        expense?: Expense;
      }
    }
  }

export const validateExpenseExist = async (req:Request, res:Response, next:NextFunction) => {
    try {
      const { expenseId } = req.params;

      const expense = await Expense.findByPk(expenseId);

      if(!expense){
        res.status(404).json(
          { error: `Expense with id ${expenseId} not found` }
        )

        return;
      };

      req.expense = expense;
      next();

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: `Has been an error` });
    }
}

export const belongsToBudget = async (req:Request, res:Response, next:NextFunction) => {
  if(req.expense.budgetId !== req.budget.id){
    const error = new Error('Invalid action');
    res.status(403).json({error: error.message})
    return;
  }

  next()
}