import { IsNotEmpty, IsString } from 'class-validator';

// Body of POST /auth/refresh and POST /auth/logout.
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
