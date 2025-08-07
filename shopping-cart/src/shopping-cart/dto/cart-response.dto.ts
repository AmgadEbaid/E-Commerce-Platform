import { ShoppingCart } from '../../../entities/shopping-cart.entity';

export class CartResponseDto {
    id: string;
    cartItems: any[];
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(cart: ShoppingCart) {
        this.id = cart.id;
        this.cartItems = cart.cartItems;
        this.totalPrice = cart.totalPrice;
        this.createdAt = cart.createdAt;
        this.updatedAt = cart.updatedAt;
    }
}
