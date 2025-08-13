import { Controller, Inject } from '@nestjs/common';
import {
    ClientProxy,
    EventPattern,
    MessagePattern,
    Payload,
    RpcException,
} from '@nestjs/microservices';
import { Order } from 'entities/orders.entity';
import { StripeService } from 'src/stripeModule/stripe.service';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly StripeService: StripeService,
        @Inject('NATS_SERVICE') private client: ClientProxy,
    ) { }

    @MessagePattern({ cmd: 'create_orderSesshion' })
    async create_orderSesshion(order: Order) {
        const PaymentSessions =
            await this.StripeService.CreatPaymentSessions(order);

        if (!PaymentSessions) {
            throw new RpcException('Failed to create payment session');
        }

        this.client.emit('payment_session_created', {
            orderId: order.id,
            userId: order.userId,
            sessionUrl: PaymentSessions.url,
            PaymentSessionsId: PaymentSessions.id,
        });

        return PaymentSessions.url;
    }

    @MessagePattern({ cmd: 'handleStripeWebhook' })
    async handleStripeWebhook(@Payload() data: { payload: any, signature: any }) {

        const { payload, signature } = data;
        const reconstructedPayload = Buffer.from(payload.data);

        return this.StripeService.handleStripeWebhook(reconstructedPayload, signature);
    }

    @EventPattern('payment.succeeded')
    async handlePaymentSucceeded(@Payload() data: { orderId: string, customerId: string, paymentIntentId: string }) {
        const { paymentIntentId } = data;
        const chargeId = await this.StripeService.getLatestCharge(paymentIntentId);
        this.client.emit('charge created', { chargeId: chargeId, orderId: data.orderId });
    }


    @EventPattern('refund payment')
    async refundPayment(@Payload() chargeId: string) {
        console.log('Refunding payment with chaafasdfadsf rgeId:', chargeId);
        await this.StripeService.refundPayment(chargeId);
    }
}
