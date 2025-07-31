import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
