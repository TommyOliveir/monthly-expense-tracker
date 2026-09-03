import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExpenseService, Expense } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';


@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  getAllExpenses(): Expense[] {
    return this.expenseService.findAll();
  }

  @Post()
  addExpense(@Body() createExpenseDto: CreateExpenseDto): Expense {
    return this.expenseService.create(createExpenseDto);
  }
}