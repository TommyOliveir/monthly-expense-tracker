import { Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    return this.prisma.budget.create({
      data: {
        amount: createBudgetDto.amount,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
        userId,
      },
    });
  }
  findAll() {
    return `This action returns all budget`;
  }

  findOne(id: number) {
    return `This action returns a #${id} budget`;
  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return `This action updates a #${id} budget`;
  }

  remove(id: number) {
    return `This action removes a #${id} budget`;
  }
}
