import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class ShoppingCartService {
  constructor(
    @Inject('NATS_SERVICE') private readonly shoppingCartClient: ClientProxy,
  ) {}

  async getCart(userId: string) {
    return this.shoppingCartClient.send({ cmd: 'get_cart' }, userId);
  }

  async addToCart(data: {
    userId: string;
    createCartItemDto: CreateCartItemDto;
  }) {
    return this.shoppingCartClient
      .send({ cmd: 'add_to_cart' }, data)
      .toPromise();
  }

  async updateCartItem(data: {
    userId: string;
    updateCartItemDto: UpdateCartItemDto;
  }) {
    return this.shoppingCartClient
      .send({ cmd: 'update_cart_item' }, data)
      .toPromise();
  }

  async removeFromCart(data: { userId: string; cartItemId: string }) {
    return this.shoppingCartClient
      .send({ cmd: 'remove_from_cart' }, data)
      .toPromise();
  }

  async clearCart(userId: string) {
    return this.shoppingCartClient
      .send({ cmd: 'clear_cart' }, userId)
      .toPromise();
  }
}
