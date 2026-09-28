import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { CreateUserDto } from './dto/create-user-dto';

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
        // Seed default categories directly for the new user
        categories: {
          create: [
            {
              name: 'Markets & dining',
              color: '#c96f4a',
              initial: 'G',
              isDefault: true,
            },
            {
              name: 'Subscriptions',
              color: '#d99a3d',
              initial: 'S',
              isDefault: true,
            },
            {
              name: 'Housing',
              color: '#7d8c5c',
              initial: 'U',
              isDefault: true,
            },
            {
              name: 'Transport',
              color: '#8c6a54',
              initial: 'T',
              isDefault: true,
            },
          ],
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
