
import { IsOptional, IsString } from 'class-validator';
import { AddressDto } from './address.dto';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  address?: AddressDto;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  profilePicture?: any;
}
