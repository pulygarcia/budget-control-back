import { Request, Response } from "express";
import Budget  from "../models/budget.model";

export class BudgetController {
  static async getAll(req: Request, res: Response) {
    try {
      const budgets = await Budget.findAll();
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
}