import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(createBudgetDto: CreateBudgetDto, userId: string) {
    const { amount, month, year } = createBudgetDto;

    return this.prisma.budget.upsert({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
      update: {
        amount,
      },
      create: {
        amount,
        year,
        month,
        userId,
      },
    });
  }

  async getMonthlySummary(userId: string, month: number, year: number) {
    // 1. Fetch Budget target for the month
    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_year_month: { userId, year, month },
      },
    });

    // Calculate start and end date for the target month in UTC
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // 2. Fetch all Expenses
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const totalSpent = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    const budgetAmount = budget ? Number(budget.amount) : 0;
    const remaining = budgetAmount - totalSpent;

    return {
      budget: budgetAmount,
      totalSpent,
      remaining,
      month,
      year,
      expenses: expenses.map((e) => ({
        ...e,
        amount: Number(e.amount),
      })),
    };
  }

  ///////////////////////////////////

  async findAllForUser(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByMonthAndYear(userId: string, month: number, year: number) {
    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
    });

    return budget || { amount: 0, year, month, userId };
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });
  }

  async remove(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.delete({
      where: { id },
    });
  }
}
