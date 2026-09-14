import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ExpenseService } from './expense/expense.service';
import { ExpenseController } from './expense/expense.controller';
import { ExpenseModule } from './expense/expense.module';

@Module({
  imports: [UsersModule, ExpenseModule],
  controllers: [AppController, ExpenseController],
  providers: [AppService, ExpenseService],
})
export class AppModule {}
