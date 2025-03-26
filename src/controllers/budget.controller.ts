import { Request, Response } from "express";
import Budget  from "../models/budget.model";

export class BudgetController {
  static async getAll(req: Request, res: Response) {
    try {
      const budgets = await Budget.findAll(); //TODO: filter by authenticated user
      res.status(200).json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Error getting budgets" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
        const { name, amount } = req.body;

        const budget = new Budget({ name, amount });

        await budget.save();  

        res.status(201).json(budget);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error creating budget" });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
       const budget = req.budget;

        res.status(201).json(budget);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Error getting budget` });
    }
  }

  static async updateBudget(req: Request, res: Response) {
    try {
        const {name, amount} = req.body;
        const budget = req.budget;

        const newData = {
            name: name || budget.name,
            amount: amount || budget.amount
        }
        await budget.update(newData);

        res.status(201).json({
            msg: 'Budget has been updated'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Could not update budget` });
    }
  }

  static async deleteBudget(req: Request, res: Response) {
    try {
        const budget = req.budget

        await budget.destroy();

        res.status(201).json({
            msg: 'Budget has been deleted'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Error deleting budget` });
    }
  }
}