import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { NormalizeEmail } from '@/common/transformers/normalize-email';

export class LoginDto {
  @NormalizeEmail()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
