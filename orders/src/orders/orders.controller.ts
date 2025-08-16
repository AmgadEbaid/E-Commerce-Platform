import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from '../../entities/orders.entity';
import { lastValueFrom } from 'rxjs';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService, @Inject('NATS_SERVICE') private client: ClientProxy) { }

    @MessagePattern({ cmd: 'create_order_from_cart' })
    async createOrderFromCart(data: { userId: string }) {
        const order: Order = await this.ordersService.createOrderFromCart(data.userId);
        const PaymentSessionsUrl = await lastValueFrom(
            this.client.send({ cmd: 'create_orderSesshion' }, order),
        );
        if (!PaymentSessionsUrl) {
            throw new Error('Failed to create payment session');
        }
        return { order, PaymentSessionsUrl };

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
        const order = await this.ordersService.updateOrderStatus(
            data.userId,
            data.orderId,
            data.status
        );
        this.client.emit(`order.${data.status.toLowerCase()}`, { order });
        return order;
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

    @EventPattern('payment_session_created')
    async handlePaymentSessionCreated(
        @Payload() data: { orderId: string; userId: string; sessionUrl: string; PaymentSessionsId: string }) {
       await this.ordersService.updateOrderSession(data);
    }

    @EventPattern('refund_order')
    async orderRefund(
        @Payload() data: { orderId: string; userId }) {
        const chargeId = await this.ordersService.GetLatestCharge(data);
        this.client.emit('refund payment', { chargeId });
    }

    @EventPattern('payment.succeeded')
    async handlePaymentSucceeded(@Payload() data: { orderId: string, customerId: string, paymentIntentId: string }) {
        const { orderId } = data;
        const order = await this.ordersService.updateOrderStatusById(orderId, OrderStatus.PAID);
        this.client.emit('order.paid', { order });
    }

    @EventPattern('payment.refunded')
    async handlePaymentRefunded(@Payload() data: { chargeId: string }) {
        const order = await this.ordersService.refundOrder(data.chargeId);
        this.client.emit('order.refunded', { order });
    }

    @EventPattern('payment.expired')
    async handlePaymentExpired(@Payload() data: { orderId: string }) {
        const { orderId } = data;
        const order = await this.ordersService.cancelOrderById(orderId);
        this.client.emit('order.cancelled', { order });
    }

    @EventPattern('charge created')
    async saveCharge(@Payload() data: { chargeId: string, orderId: string }) {
        const { chargeId, orderId } = data;
        await this.ordersService.updateChargeId(chargeId, orderId);
    }
}
