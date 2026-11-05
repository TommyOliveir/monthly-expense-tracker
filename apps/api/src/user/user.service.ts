import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { hash } from 'argon2';
import { CreateUserDto } from './dto/create-user-dto';
import { Prisma } from '@prisma/client';

// Every new account gets its own copy of these categories,
// because category listing only returns rows owned by the user.
const DEFAULT_CATEGORIES: Prisma.CategoryCreateWithoutUserInput[] = [
  { name: 'Markets & dining', color: '#c96f4a', initial: 'G', isDefault: true },
  { name: 'Subscriptions', color: '#d99a3d', initial: 'S', isDefault: true },
  { name: 'Housing', color: '#7d8c5c', initial: 'U', isDefault: true },
  { name: 'Transport', color: '#8c6a54', initial: 'T', isDefault: true },
];

type CreateGoogleUserInput = {
  email: string;
  name: string | null;
  googleId: string;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    // Hash plaintext password ONCE
    const hashedPassword = await hash(password);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        categories: { create: DEFAULT_CATEGORIES },
      },
    });
  }

  async createFromGoogle({ email, name, googleId }: CreateGoogleUserInput) {
    return this.prisma.user.create({
      data: {
        email,
        name,
        googleId,
        categories: { create: DEFAULT_CATEGORIES },
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  // Case-insensitive so accounts created before emails were lowercased still match.
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 2. Generic update method (used to update refreshTokenHash, profile, etc.)
  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
