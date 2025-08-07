import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Otp } from './otp.entity';
import { Address } from './address.entity';
import { Product } from './product.entity';
import { ShoppingCart } from './shopping-cart.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;
  @Column()
  name: string;
  @OneToMany(() => Otp, (otp) => otp.user)
  otp: Otp[];

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => Address, { nullable: true })
  @JoinColumn()
  address: Address

  @OneToMany(() => Product, (product) => product.user)
  products: Product

  @OneToOne(() => ShoppingCart, (shoppingCart) => shoppingCart.user)
  shoppingCart: ShoppingCart;

}