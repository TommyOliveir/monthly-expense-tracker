import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if needed
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          userId,
        },
      });
    } catch (error) {
      // Handles duplicate category name for the same user (@@unique([userId, name]))
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A category with this name already exists.',
        );
      }
      throw error;
    }
  }

  async findAllForUser(userId: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [
          { userId }, // User-created categories
          // { isDefault: true }, // System default categories
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    if (category.isDefault || category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to edit this category.',
      );
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A category with this name already exists.',
        );
      }
      throw error;
    }
  }

  // async remove(userId: string, id: string) {
  //   const category = await this.prisma.category.findUnique({
  //     where: { id },
  //   });

  //   if (!category) {
  //     throw new NotFoundException('Category not found.');
  //   }

  //   // Prevent deleting default system categories or categories owned by other users
  //   if (category.isDefault || category.userId !== userId) {
  //     throw new ForbiddenException(
  //       'You do not have permission to delete this category.',
  //     );
  //   }

  //   return await this.prisma.category.delete({
  //     where: { id },
  //   });
  // }

  // ... inside CategoryService

  async remove(userId: string, id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    // Prevent deleting default system categories or categories owned by other users
    if (category.isDefault || category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this category.',
      );
    }

    // 1. Check if any expenses are associated with this category
    const expenseCount = await this.prisma.expense.count({
      where: { categoryId: id },
    });

    // 2. Block deletion if expenses exist
    if (expenseCount > 0) {
      throw new ConflictException(
        `Cannot delete category because it contains ${expenseCount} expense(s). Please reassign or delete the expenses first.`,
      );
    }

    // 3. Safe to delete since count is 0
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
