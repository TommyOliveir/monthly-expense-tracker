import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';


export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
}

@Injectable()
export class ExpenseService {
  private expenses: Expense[] = [
    { id: 1, title: 'Groceries', amount: 85.50, category: 'Food' },
    { id: 2, title: 'Electricity', amount: 120.00, category: 'Utilities' },
  ];

  findAll(): Expense[] {
    return this.expenses;
  }

  create(dto: CreateExpenseDto): Expense {
    const newExpense: Expense = {
      id: Date.now(),
      ...dto,
    };
    this.expenses.push(newExpense);
    return newExpense;
  }
}