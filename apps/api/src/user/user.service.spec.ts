import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  const findFirst = jest.fn();

  beforeEach(async () => {
    findFirst.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: { user: { findFirst } } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findByEmail', () => {
    it('looks the email up case-insensitively, oldest account first', async () => {
      const user = { id: 'user-1', email: 'Tommy@Mail.com' };
      findFirst.mockResolvedValue(user);

      await expect(service.findByEmail(' tommy@mail.com ')).resolves.toBe(user);
      expect(findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'tommy@mail.com', mode: 'insensitive' } },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('returns null when no account matches', async () => {
      findFirst.mockResolvedValue(null);

      await expect(service.findByEmail('nobody@mail.com')).resolves.toBeNull();
    });
  });
});
