import { Module } from '@nestjs/common';
import { ShoppingCartController } from './shopping-cart.controller';
import { ShoppingCartService } from './shopping-cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'entities/product.entity';
import { User } from 'entities/user.entity';
import { ShoppingCart } from 'entities/shopping-cart.entity';
import { cartItem } from 'entities/cart-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, ShoppingCart,cartItem])],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService]
})
export class ShoppingCartModule {}
