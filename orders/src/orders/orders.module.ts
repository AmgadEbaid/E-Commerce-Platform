import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../../entities/orders.entity';
import { OrderItem } from '../../entities/orderItem.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { Address } from '../../entities/address.entity';
import { ShoppingCart } from '../../entities/shopping-cart.entity';
import { NatsClientModule } from 'src/nats-client/nats-client.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, Product, User, Address, ShoppingCart]),NatsClientModule
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService]
})
export class OrdersModule {}
