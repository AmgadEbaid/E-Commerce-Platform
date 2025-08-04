import { IsString, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  userId: string;
}
