import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  amount: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  year: number;

  @IsString()
  userId: string;
}
