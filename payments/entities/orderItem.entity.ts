import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './orders.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ type: 'uuid' })
  productId: string;

  
  @Column({ nullable: true })
  productImage: string;


  @Column()
  quantity: number;

  @Column()
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtTimeOfOrder: number;



  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;
}