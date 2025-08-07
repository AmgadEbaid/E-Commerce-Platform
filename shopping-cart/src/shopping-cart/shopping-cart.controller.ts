import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShoppingCartService } from './shopping-cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ShoppingCart } from '../../entities/shopping-cart.entity';

@Controller()
export class ShoppingCartController {
    constructor(private readonly shoppingCartService: ShoppingCartService) {}

    @MessagePattern({ cmd: 'get_cart' })
    async getCart(userId: string): Promise<ShoppingCart> {
        return this.shoppingCartService.getCart(userId);
    }

    @MessagePattern({ cmd: 'add_to_cart' })
    async addToCart(data: { userId: string; createCartItemDto: CreateCartItemDto }): Promise<ShoppingCart> {
        return this.shoppingCartService.addItemToCart(
            data.userId,
            data.createCartItemDto
        );
    }

    @MessagePattern({ cmd: 'update_cart_item' })
    async updateCartItem(data: { userId: string; updateCartItemDto: UpdateCartItemDto }): Promise<ShoppingCart> {
        return this.shoppingCartService.updateCartItemQuantity(
            data.userId,
            data.updateCartItemDto
        );
    }

    @MessagePattern({ cmd: 'remove_from_cart' })
    async removeFromCart(data: { userId: string; cartItemId: string }): Promise<void> {
        await this.shoppingCartService.removeItemFromCart(
            data.userId,
            data.cartItemId
        );
    }

    @MessagePattern({ cmd: 'clear_cart' })
    async clearCart(userId: string): Promise<void> {
        await this.shoppingCartService.clearCart(userId);
    }
}
