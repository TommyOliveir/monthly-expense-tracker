import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// Match your schema output path (use '@prisma/client' if using default generation path)
// import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Connect to the database when the NestJS module starts up
  async onModuleInit() {
    await this.$connect();
  }

  // Gracefully disconnect from the database when the app stops
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
