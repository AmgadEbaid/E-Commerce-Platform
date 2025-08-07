import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateShoppingCartDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
