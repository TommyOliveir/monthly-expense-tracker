import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

type CreateSessionInput = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
};

type RotateSessionInput = {
  id: string;
  currentHash: string;
  nextHash: string;
  expiresAt: Date;
};

// Data access for the `sessions` table: one row per signed-in device.
@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateSessionInput): Promise<Session> {
    return this.prisma.session.create({ data: input });
  }

  findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  // Compare-and-swap on the stored hash: when two refreshes race with the same
  // token, only the first one wins and the other gets `false`.
  async rotate({
    id,
    currentHash,
    nextHash,
    expiresAt,
  }: RotateSessionInput): Promise<boolean> {
    const { count } = await this.prisma.session.updateMany({
      where: { id, refreshTokenHash: currentHash },
      data: { refreshTokenHash: nextHash, expiresAt },
    });
    return count === 1;
  }

  async deleteForUser(id: string, userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id, userId } });
  }

  async deleteExpiredForUser(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });
  }
}
