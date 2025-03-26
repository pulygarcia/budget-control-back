import { Request, Response, NextFunction } from "express"
import Budget from "../models/budget.model";

declare global {
    namespace Express {
      interface Request {
        budget?: Budget;
      }
    }
  }

export const valiadateHandleExist = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const { id } = req.params;

        const budget = await Budget.findByPk(id);

        if(!budget){
            res.status(404).json(
                { error: `Budget with id ${id} not found` }
            )

            return;
        };

        req.budget = budget;

    } catch (error) {
        console.log(error);
        res.status(404).json({ error: `Badget not found` });
        }

    next();
}