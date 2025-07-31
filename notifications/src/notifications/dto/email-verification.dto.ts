import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otc: string;
}
