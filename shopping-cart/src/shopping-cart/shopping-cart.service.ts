import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCart } from '../../entities/shopping-cart.entity';
import { cartItem } from '../../entities/cart-item.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ShoppingCartService {
    constructor(
        @InjectRepository(ShoppingCart)
        private shoppingCartRepository: Repository<ShoppingCart>,
        @InjectRepository(cartItem)
        private cartItemRepository: Repository<cartItem>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async getOrCreateCart(userId: string): Promise<ShoppingCart> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: {shoppingCart:true} });
        if (!user) {
            throw new RpcException('User not found');
        }

        if (!user.shoppingCart) {
            const newCart = this.shoppingCartRepository.create({ user });
            return await this.shoppingCartRepository.save(newCart);
        }


        return user.shoppingCart;
    }

    async addItemToCart(userId: string, createCartItemDto: CreateCartItemDto): Promise<CartResponseDto> {
        const cart = await this.getOrCreateCart(userId);
        const product = await this.productRepository.findOne({ where: { id: createCartItemDto.productId } });

        if (!product) {
            throw new RpcException('Product not found');
        }

        if (product.stock === 0) {
            throw new RpcException('Product is out of stock');
        }

        if (product.stock < createCartItemDto.quantity) {
            throw new RpcException('Not enough stock available');
        }

        let cartItem = await this.cartItemRepository.findOne({
            where: {
                shoppingCart: { id: cart.id },
                product: { id: product.id }
            }
        });

        if (cartItem) {
            cartItem.quantity += createCartItemDto.quantity;
        } else {
            cartItem = this.cartItemRepository.create({
                shoppingCart: cart,
                product,
                quantity: createCartItemDto.quantity
            });
        }

        await this.cartItemRepository.save(cartItem);
        return this.getCart(userId);
    }

    async getCart(userId: string): Promise<CartResponseDto> {
        const cart = await this.shoppingCartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['cartItems', 'cartItems.product']
        });

        if (!cart) {
            throw new RpcException('Shopping cart not found');
        }

        return new CartResponseDto(cart);
    }

    async removeItemFromCart(userId: string, cartItemId: string): Promise<void> {
        const cart = await this.getCart(userId);
        const cartItem = cart.cartItems.find(item => item.id === cartItemId);

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        await this.cartItemRepository.remove(cartItem);
    }

    async updateCartItemQuantity(
        userId: string,
        updateCartItemDto: UpdateCartItemDto
    ): Promise<CartResponseDto> {
        const cart = await this.getCart(userId);
        const cartItem = cart.cartItems.find(item => item.id === updateCartItemDto.cartItemId);

        if (!cartItem) {
            throw new RpcException('Cart item not found');
        }

        if (updateCartItemDto.quantity <= 0) {
            await this.cartItemRepository.remove(cartItem);
        } else {
            if (cartItem.product.stock < updateCartItemDto.quantity) {
                throw new RpcException('Not enough stock available');
            }
            cartItem.quantity = updateCartItemDto.quantity;
            await this.cartItemRepository.save(cartItem);
        }

        return this.getCart(userId);
    }

    async clearCart(userId: string): Promise<void> {
        const cart = await this.getCart(userId);
        await this.cartItemRepository.remove(cart.cartItems);
    }
}
