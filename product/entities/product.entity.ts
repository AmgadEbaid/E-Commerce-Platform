import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Category } from "./category.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
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
    nullable: true,
  })
  images: string[];

  @ManyToOne(() => User, (user) => user.products)
  user: User

  @ManyToOne(() => Category, (category) => category.products)
  category: Category

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}