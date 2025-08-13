import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
    constructor(
        @Inject('NATS_SERVICE') private readonly ordersClient: ClientProxy
    ) {}

    async createOrderFromCart(userId: string) {
        return firstValueFrom(
            this.ordersClient.send({ cmd: 'create_order_from_cart' }, { userId })
        );
    }

    async getOrder(userId: string, orderId: string) {
        return firstValueFrom(
            this.ordersClient.send({ cmd: 'get_order' }, { userId, orderId })
        );
    }

    async getUserOrders(userId: string) {
        return firstValueFrom(
            this.ordersClient.send({ cmd: 'get_user_orders' }, userId)
        );
    }

    async updateOrderStatus(userId: string, orderId: string, status: string) {
        return firstValueFrom(
            this.ordersClient.send(
                { cmd: 'update_order_status' },
                { userId, orderId, status }
            )
        );
    }

    async cancelOrder(userId: string, orderId: string) {
        return firstValueFrom(
            this.ordersClient.send(
                { cmd: 'cancel_order' },
                { userId, orderId }
            )
        );
    }

    async getAllOrdersPaginated(page = 1, limit = 10) {
        return firstValueFrom(
            this.ordersClient.send(
                { cmd: 'get_all_orders_paginated' },
                { page, limit }
            )
        );
    }

    async getOrderById(orderId: string) {
        return firstValueFrom(
            this.ordersClient.send(
                { cmd: 'get_order_by_id' },
                { orderId }
            )
        );
    }

    
    async refundOrder(userId: string, orderId: string) {
        return firstValueFrom(
            this.ordersClient.emit(
                'refund_order',
                { userId, orderId }
            )
        );
    }

}
