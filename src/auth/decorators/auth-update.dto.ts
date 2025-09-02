import { IsString } from 'class-validator';

export class AuthUpdateDto {
  @IsString()
  email?: string;

  @IsString()
  phone?: string;
}
