import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}
