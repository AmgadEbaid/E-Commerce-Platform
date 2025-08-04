import { IsInt, IsObject, IsString } from 'class-validator';
import { UpdateCategoryDto } from './update-category.dto';

export class UpdateCategoryPayloadDto {
  @IsString()
  id: string;

  @IsObject()
  updateCategoryDto: UpdateCategoryDto;

  @IsString()
  userId: string;
}
