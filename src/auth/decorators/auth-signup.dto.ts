import { IsEmail, IsString } from 'class-validator';

export class AuthSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  passwordRepeat: string;
}
