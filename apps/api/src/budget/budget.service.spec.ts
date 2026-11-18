import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { BudgetService } from './budget.service';

const USER_ID = 'user-1';

describe('BudgetService', () => {
  let service: BudgetService;
  const prisma = {
    budget: { findFirst: jest.fn() },
    expense: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
  });

  describe('getMonthlySummary', () => {
    it('combines the budget and the month expenses into totals', async () => {
      prisma.budget.findFirst.mockResolvedValue({
        amount: new Prisma.Decimal('1000.00'),
      });
      prisma.expense.findMany.mockResolvedValue([
        { id: 'expense-1', amount: new Prisma.Decimal('250.50') },
        { id: 'expense-2', amount: new Prisma.Decimal('100.25') },
      ]);

      const summary = await service.getMonthlySummary(USER_ID, '11', '2026');

      expect(summary).toEqual({
        budget: 1000,
        totalSpent: 350.75,
        remaining: 649.25,
        month: 11,
        year: 2026,
        expenses: [
          { id: 'expense-1', amount: 250.5 },
          { id: 'expense-2', amount: 100.25 },
        ],
      });
      const monthFilter = { userId: USER_ID, year: 2026, month: 11 };
      expect(prisma.budget.findFirst).toHaveBeenCalledWith({
        where: monthFilter,
      });
      expect(prisma.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: monthFilter }),
      );
    });

    it('reports a zero budget when none is set for the month', async () => {
      prisma.budget.findFirst.mockResolvedValue(null);
      prisma.expense.findMany.mockResolvedValue([]);

      const summary = await service.getMonthlySummary(USER_ID, 11, 2026);

      expect(summary).toEqual(
        expect.objectContaining({ budget: 0, totalSpent: 0, remaining: 0 }),
      );
    });
  });
});
