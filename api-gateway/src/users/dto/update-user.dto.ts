import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AddressDto } from './address.dto';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  name?: string;
}
