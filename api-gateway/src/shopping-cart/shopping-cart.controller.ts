import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { ShoppingCartService } from './shopping-cart.service';


@UseGuards(AuthGuard('jwt'), VerifiedGuard)
@Controller('shopping-cart')
export class ShoppingCartController {
    constructor(private readonly shoppingCartService: ShoppingCartService) {}

    @Get()
    async getCart(@Request() req) {
        return this.shoppingCartService.getCart(req.user.id);
    }

    @Post()
    async addToCart(
        @Request() req,
        @Body() createCartItemDto: CreateCartItemDto
    ) {
        return this.shoppingCartService.addToCart({
            userId: req.user.id,
            createCartItemDto
        });
    }

    @Put('items')
    async updateCartItem(
        @Request() req,
        @Body() updateCartItemDto: UpdateCartItemDto
    ) {
        return this.shoppingCartService.updateCartItem({
            userId: req.user.id,
            updateCartItemDto
        });
    }

    @Delete('items/:cartItemId')
    async removeFromCart(
        @Request() req,
        @Param('cartItemId') cartItemId: string
    ) {
        await this.shoppingCartService.removeFromCart({
            userId: req.user.id,
            cartItemId
        });
    }

    @Delete()
    async clearCart(@Request() req) {
        await this.shoppingCartService.clearCart(req.user.id);
    }
}
