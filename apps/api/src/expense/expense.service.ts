import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

const EXPENSE_NOT_FOUND = 'Expense not found.';

// `year`/`month` are stored alongside `date` for the (userId, year, month) index,
// so they must be derived every time `date` is written.
function getYearMonth(date: Date) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCategoryUsable(userId: string, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Selected category does not exist.');
    }

    // Defaults are shared; custom categories only by their owner.
    if (!category.isDefault && category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this category.',
      );
    }
  }

  async create(userId: string, dto: CreateExpenseDto) {
    await this.assertCategoryUsable(userId, dto.categoryId);

    const expenseDate = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.expense.create({
      data: {
        name: dto.name,
        amount: dto.amount,
        method: dto.method ?? 'Card',
        date: expenseDate,
        ...getYearMonth(expenseDate),
        userId,
        categoryId: dto.categoryId,
      },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });
  }

  async findAllForUser(userId: string, year?: number, month?: number) {
    return this.prisma.expense.findMany({
      where: {
        userId,
        ...(year && { year }),
        ...(month && { month }),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    // Scoped by userId: another user's expense is reported as missing,
    // so the response doesn't reveal that it exists.
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException(EXPENSE_NOT_FOUND);
    }

    if (dto.categoryId && dto.categoryId !== expense.categoryId) {
      await this.assertCategoryUsable(userId, dto.categoryId);
    }

    const data: Prisma.ExpenseUncheckedUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.method !== undefined && { method: dto.method }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
    };

    if (dto.date !== undefined) {
      const expenseDate = new Date(dto.date);
      data.date = expenseDate;
      Object.assign(data, getYearMonth(expenseDate));
    }

    return this.prisma.expense.update({
      where: { id: expense.id },
      data,
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const { count } = await this.prisma.expense.deleteMany({
      where: { id, userId },
    });

    if (count === 0) {
      throw new NotFoundException(EXPENSE_NOT_FOUND);
    }

    return { id };
  }
}
