import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  // The ID token (JWT) that Google Identity Services hands to the browser.
  @IsString()
  @IsNotEmpty()
  credential: string;
}
