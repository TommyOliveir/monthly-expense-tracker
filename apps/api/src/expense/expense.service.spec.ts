import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { ExpenseService } from './expense.service';

const USER_ID = 'user-1';

const existingExpense = {
  id: 'expense-1',
  userId: USER_ID,
  name: 'Groceries',
  amount: 300,
  categoryId: 'category-1',
  date: new Date('2026-11-05T00:00:00.000Z'),
  year: 2026,
  month: 11,
};

describe('ExpenseService', () => {
  let service: ExpenseService;
  const prisma = {
    expense: {
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.expense.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...existingExpense, ...data }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  describe('update', () => {
    it('updates only the fields that were sent', async () => {
      prisma.expense.findFirst.mockResolvedValue(existingExpense);

      await service.update(USER_ID, 'expense-1', { amount: 450 });

      expect(prisma.expense.findFirst).toHaveBeenCalledWith({
        where: { id: 'expense-1', userId: USER_ID },
      });
      expect(prisma.expense.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'expense-1' },
          data: { amount: 450 },
        }),
      );
      expect(prisma.category.findUnique).not.toHaveBeenCalled();
    });

    it('re-derives year and month when the date changes', async () => {
      prisma.expense.findFirst.mockResolvedValue(existingExpense);

      await service.update(USER_ID, 'expense-1', {
        date: '2026-12-15T12:00:00.000Z',
      });

      expect(prisma.expense.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            date: new Date('2026-12-15T12:00:00.000Z'),
            year: 2026,
            month: 12,
          },
        }),
      );
    });

    it("reports another user's expense as not found", async () => {
      prisma.expense.findFirst.mockResolvedValue(null);

      await expect(
        service.update(USER_ID, 'someone-elses', { amount: 1 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.expense.update).not.toHaveBeenCalled();
    });

    it("rejects moving the expense to another user's category", async () => {
      prisma.expense.findFirst.mockResolvedValue(existingExpense);
      prisma.category.findUnique.mockResolvedValue({
        id: 'category-2',
        isDefault: false,
        userId: 'user-2',
      });

      await expect(
        service.update(USER_ID, 'expense-1', { categoryId: 'category-2' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.expense.update).not.toHaveBeenCalled();
    });

    it('allows moving the expense to a default category', async () => {
      prisma.expense.findFirst.mockResolvedValue(existingExpense);
      prisma.category.findUnique.mockResolvedValue({
        id: 'category-3',
        isDefault: true,
        userId: null,
      });

      await service.update(USER_ID, 'expense-1', { categoryId: 'category-3' });

      expect(prisma.expense.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { categoryId: 'category-3' } }),
      );
    });
  });

  describe('remove', () => {
    it("deletes the user's own expense", async () => {
      prisma.expense.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.remove(USER_ID, 'expense-1')).resolves.toEqual({
        id: 'expense-1',
      });
      expect(prisma.expense.deleteMany).toHaveBeenCalledWith({
        where: { id: 'expense-1', userId: USER_ID },
      });
    });

    it('reports a missing or foreign expense as not found', async () => {
      prisma.expense.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.remove(USER_ID, 'someone-elses'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
