import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(
    @GetUser('id') userId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.create(userId, createCategoryDto);
  }

  // GET /category -> Gets all categories for the logged-in user
  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.categoryService.findAllForUser(userId);
  }

  // PATCH /category/:id -> Updates a category owned by the user
  @Patch(':id')
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(userId, id, updateCategoryDto);
  }

  // DELETE /category/delete/:id -> Deletes a category owned by the user
  @Delete('delete/:id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.categoryService.remove(userId, id);
  }
}
