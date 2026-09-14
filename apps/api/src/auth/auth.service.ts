import { CreateUserDto } from '../user/dto/create-user-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  registerUser(createUserDto: CreateUserDto) {
    throw new Error('Error');
  }
}
