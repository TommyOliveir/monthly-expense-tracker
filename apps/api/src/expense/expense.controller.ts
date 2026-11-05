import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { IAuthenticatedRequest } from '@/auth/types/user';
import { GetUser } from '@/auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  getAllExpenses(
    @Request() req: IAuthenticatedRequest,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const monthNum = month ? parseInt(month, 10) : undefined;
    return this.expenseService.findAllForUser(req.user.id, yearNum, monthNum);
  }

  @Post()
  addExpense(
    @Request() req: IAuthenticatedRequest,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expenseService.create(req.user.id, createExpenseDto);
  }

  // PATCH /expense/:id -> updates an expense owned by the user
  @Patch(':id')
  updateExpense(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(userId, id, updateExpenseDto);
  }

  // DELETE /expense/:id -> deletes an expense owned by the user
  @Delete(':id')
  deleteExpense(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.expenseService.remove(userId, id);
  }
}
