import { Request, Response, NextFunction } from "express"
import Budget from "../models/budget.model";

declare global {
    namespace Express {
      interface Request {
        budget?: Budget;
      }
    }
  }

export const validateBudgetExist = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const { budgetId } = req.params;

        const budget = await Budget.findByPk(budgetId);

        if(!budget){
            res.status(404).json(
                { error: `Budget with id ${budgetId} not found` }
            )

            return;
        };

        req.budget = budget;

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Has been an error` });
    }

    next();
}