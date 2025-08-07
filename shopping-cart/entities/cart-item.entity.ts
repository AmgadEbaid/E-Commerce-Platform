import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";
import { ShoppingCart } from "./shopping-cart.entity";

@Entity()
export class cartItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => ShoppingCart, (shoppingCart) => shoppingCart.cartItems, {
        onDelete: 'CASCADE',
        nullable: false
    })
    shoppingCart: ShoppingCart;

    @ManyToOne(() => Product, (product) => product.cartItems, {
        onDelete: 'NO ACTION',
        nullable: false
    })
    product: Product;

    @Column()
    quantity: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}