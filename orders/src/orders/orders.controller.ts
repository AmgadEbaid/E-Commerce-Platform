import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../../entities/orders.entity';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @MessagePattern({ cmd: 'create_order_from_cart' })
    async createOrderFromCart(data: { userId: string }) {
        return this.ordersService.createOrderFromCart(data.userId);
    }

    @MessagePattern({ cmd: 'get_order' })
    async getOrder(data: { userId: string; orderId: string }) {
        return this.ordersService.getOrder(data.userId, data.orderId);
    }

    @MessagePattern({ cmd: 'get_user_orders' })
    async getUserOrders(userId: string) {
        return this.ordersService.getUserOrders(userId);
    }

    @MessagePattern({ cmd: 'update_order_status' })
    async updateOrderStatus(data: { userId: string; orderId: string; status: OrderStatus }) {
        return this.ordersService.updateOrderStatus(
            data.userId,
            data.orderId,
            data.status
        );
    }

    @MessagePattern({ cmd: 'cancel_order' })
    async cancelOrder(data: { userId: string; orderId: string }) {
        return this.ordersService.cancelOrder(data.userId, data.orderId);
    }

    @MessagePattern({ cmd: 'get_all_orders_paginated' })
    async getAllOrdersPaginated(data: { page?: number; limit?: number }) {
        return this.ordersService.getAllOrdersPaginated(data.page, data.limit);
    }

    @MessagePattern({ cmd: 'get_order_by_id' })
    async getOrderById(data: { orderId: string }) {
        return this.ordersService.getOrderById(data.orderId);
    }
}
