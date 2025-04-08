import { Request, Response } from "express";
import Budget  from "../models/budget.model";
import Expense from "../models/expense.model";

export class BudgetController {
  static async getAll(req: Request, res: Response) {
    try {
      const budgets = await Budget.findAll({where:{userId: req.user.id}}); //filter by authenticated user
      res.status(200).json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Error getting budgets" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
        const { name, amount } = req.body;

        const budget = new Budget({ name, amount, userId: req.user.id});

        await budget.save();  

        res.status(201).json(budget);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error creating budget" });
    }
  }

  static async findById(req: Request, res: Response) {
    const budget = await Budget.findByPk(req.budget.id, {
      include: [{ model: Expense }] // Include related expenses
    });
    
    res.status(201).json(budget);
  }

  static async updateBudget(req: Request, res: Response) {
      const newData = {
          name: req.body.name || req.budget.name,
          amount: req.body.amount || req.budget.amount
      }

      await req.budget.update(newData); //budget is injected in req by the middleware 'validateHandleExist (budget)'

      res.status(201).json({
          msg: 'Budget has been updated'
      });
  }

  static async deleteBudget(req: Request, res: Response) {
      await req.budget.destroy();

      res.status(201).json({
        msg: 'Budget has been deleted'
      });
  }
}