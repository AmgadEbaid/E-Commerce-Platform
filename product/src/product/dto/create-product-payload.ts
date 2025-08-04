import { CreateProductDto } from './create-product.dto'; // Assuming you have this DTO
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPayloadDto {
  @IsString()
  @IsNotEmpty()
  UserId: string;

  @ValidateNested()
  @Type(() => CreateProductDto)
  createProductDto: CreateProductDto;
}