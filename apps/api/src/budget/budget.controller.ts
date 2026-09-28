import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('budget')
@UseGuards(JwtAuthGuard) // Guarantees req.user exists from validated JWT
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(
    @Body() createBudgetDto: CreateBudgetDto,
    @GetUser('id') userId: string,
  ) {
    return this.budgetService.createOrUpdate(createBudgetDto, userId);
  }

  @Get('summary')
  getSummary(
    @GetUser('id') userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.budgetService.getMonthlySummary(userId, month, year);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.budgetService.findAllForUser(userId);
  }

  @Get('single')
  findOne(
    @GetUser('id') userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.budgetService.findByMonthAndYear(userId, month, year);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @GetUser('id') userId: string,
  ) {
    return this.budgetService.update(id, updateBudgetDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.budgetService.remove(id, userId);
  }
}
