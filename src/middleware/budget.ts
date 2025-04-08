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

export const authorized = async (req:Request, res:Response, next:NextFunction) => {
  //console.log(req.user.id);
  //console.log(req.budget.userId);

  try {
    if(req.budget.userId !== req.user.id){
      const error = new Error(`Unauthorized`)
      res.status(401).json({msg: error.message});
      return;
    }

  } catch (error) {
      console.log(error);
      res.status(500).json({ error: `Has been an error` });
  }

  next();
}