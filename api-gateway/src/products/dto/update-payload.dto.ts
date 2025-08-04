import {
  IsDefined,
  IsInt,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateProductDto } from './update-product.dto';
import { Type } from 'class-transformer';

export class UpdatePayloadDto {
  @IsString()
  id: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateProductDto)
  updateProductDto: UpdateProductDto;

  @IsString()
  userId: string;
}
