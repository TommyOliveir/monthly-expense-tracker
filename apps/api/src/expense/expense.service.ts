import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    // 1. Verify category exists and belongs to the user or system defaults
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Selected category does not exist.');
    }

    if (!category.isDefault && category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this category.',
      );
    }

    // 2. Derive year & month for fast index filtering
    const expenseDate = dto.date ? new Date(dto.date) : new Date();
    const year = expenseDate.getFullYear();
    const month = expenseDate.getMonth() + 1; // 1 - 12

    // 3. Create expense with relational keys
    return this.prisma.expense.create({
      data: {
        name: dto.name,
        amount: dto.amount,
        method: dto.method ?? 'Card',
        date: expenseDate,
        year,
        month,
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
}
