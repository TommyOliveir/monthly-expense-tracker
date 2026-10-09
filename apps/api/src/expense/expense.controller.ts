// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Query,
//   UseGuards,
//   Request,
// } from '@nestjs/common';
// import { ExpenseService } from './expense.service';
// import { CreateExpenseDto } from './dto/create-expense.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
// @Controller('expense')
// export class ExpenseController {
//   constructor(private readonly expenseService: ExpenseService) {}

//   @Get()
//   getAllExpenses(
//     @Request() req,
//     @Query('year') year?: string,
//     @Query('month') month?: string,
//   ) {
//     const yearNum = year ? parseInt(year, 10) : undefined;
//     const monthNum = month ? parseInt(month, 10) : undefined;

//     return this.expenseService.findAllForUser(req.user.id, yearNum, monthNum);
//   }

//   @Post()
//   addExpense(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
//     return this.expenseService.create(req.user.id, createExpenseDto);
//   }
// }
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IAuthenticatedRequest } from 'src/auth/types/user';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}
  @Get() getAllExpenses(
    @Request() req: IAuthenticatedRequest,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const monthNum = month ? parseInt(month, 10) : undefined;
    return this.expenseService.findAllForUser(req.user.id, yearNum, monthNum);
  }
  @Post() addExpense(
    @Request() req: IAuthenticatedRequest,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expenseService.create(req.user.id, createExpenseDto);
  }
}
