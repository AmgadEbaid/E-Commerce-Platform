import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { cartItem } from "./cart-item.entity";
import { Category } from "./category.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column({
    type: 'simple-array',
    nullable: true, // It's a good practice to allow this to be null
  })
  images: string[];

  @ManyToOne(() => User, (user) => user.products)
  user: User


  @ManyToOne(() => Category, (category) => category.products)
  category: Category

  @OneToMany(() => cartItem, (item) => item.product)
  cartItems: cartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}