import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ExpenseService } from './expense/expense.service';
import { ExpenseController } from './expense/expense.controller';
import { ExpenseModule } from './expense/expense.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BudgetModule } from './budget/budget.module';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    ExpenseModule,
    PrismaModule,
    AuthModule,
    UserModule,
    BudgetModule,
    CategoryModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available across all modules without re-importing
    }),
  ],
  controllers: [AppController, ExpenseController],
  providers: [AppService, ExpenseService, PrismaService],
})
export class AppModule {}
