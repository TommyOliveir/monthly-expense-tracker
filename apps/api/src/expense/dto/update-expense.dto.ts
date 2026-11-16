import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

// Same rules as creating, but every field is optional so clients send only what changed.
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
