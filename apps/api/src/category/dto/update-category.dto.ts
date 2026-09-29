import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  initial?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
