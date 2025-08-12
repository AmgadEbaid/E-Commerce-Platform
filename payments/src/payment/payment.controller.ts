import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Order } from 'entities/orders.entity';
import { StripeService } from 'src/stripeModule/stripe.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly StripeService: StripeService,
        @Inject('NATS_SERVICE') private client: ClientProxy
    ) { }

    @MessagePattern({ cmd: 'create_orderSesshion' })
    async getUserOrders(order: Order) {
        const PaymentSessions = await this.StripeService.CreatPaymentSessions(order);

        this.client.emit('payment_session_created', {
            orderId: order.id,
            userId: order.userId,
            sessionUrl: PaymentSessions.url,
            PaymentSessionsId: PaymentSessions.id
        });

        return PaymentSessions.url
    }


}
