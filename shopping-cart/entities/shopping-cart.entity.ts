import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";
import { join } from "path";
import { cartItem } from "./cart-item.entity";

@Entity()
export class ShoppingCart {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => User, (user) => user.shoppingCart)
    @JoinColumn()
    user: User;

    @OneToMany(() => cartItem, (cartItem) => cartItem.shoppingCart)
    cartItems: cartItem[];

    get totalPrice(): number {
        if (!this.cartItems || this.cartItems.length === 0) {
            return 0;
        }
        return this.cartItems.reduce((total, item) => {
            // Assuming item.product.price is available
            const itemPrice = item.product ? item.product.price : 0;
            return total + item.quantity * itemPrice;
        }, 0);
    }


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}