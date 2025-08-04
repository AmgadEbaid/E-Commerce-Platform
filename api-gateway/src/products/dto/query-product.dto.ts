import { IsOptional, IsString, IsNumber } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  searchParam?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}
