// src/stripe/stripe.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Order } from 'entities/orders.entity';
import { Stripe } from 'stripe';

@Injectable()
export class StripeService {
    private readonly webhookSecret: string;

    constructor(
        private readonly configService: ConfigService,
        @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
        @Inject('NATS_SERVICE') private ordersClient: ClientProxy
    ) {
        this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!;

    }


    async CreatPaymentSessions(order: Order) {
        const YOUR_DOMAIN = 'http://localhost:3001';
        const lineItems = this.createStripeLineItems(order, 'usd');
        console.log(order.userId, order.id);

        const session = await this.stripe.checkout.sessions.create({
            line_items: lineItems,
            metadata: {
                orderId: order.id,
                user_id: order.userId,
            },
            success_url: `${YOUR_DOMAIN}/success.html`,
            cancel_url: `${YOUR_DOMAIN}/cancel.html`,
            mode: 'payment',
        });

        return session;
    }

    private createStripeLineItems = (
        order: Order,
        currency: string = 'usd',
    ): Stripe.Checkout.SessionCreateParams.LineItem[] => {
        if (!order || !order.items || order.items.length === 0) {
            throw new RpcException('Order must have at least one item.');
        }

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
            order.items.map((item) => {
                const unitAmount = Math.round(item.priceAtTimeOfOrder * 100);

                return {
                    price_data: {
                        currency: currency,
                        product_data: {
                            images: item.productImage ? [item.productImage] : [],
                            name: item.productName,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: item.quantity,
                };
            });

        return lineItems;
    };

    async getLatestCharge(paymentIntentId: string) {
        const paymentIntent =
            await this.stripe.paymentIntents.retrieve(paymentIntentId);
        const chargeId = paymentIntent.latest_charge;
        return chargeId;
    }

    async refundPayment(chargeId: any) {
        try {
            const charge = chargeId.chargeId
            const refund = await this.stripe.refunds.create({charge: charge});
            return refund;
        } catch (error) {
            console.error('Failed to refund payment:', error);
            throw new RpcException(`Failed to refund payment: ${error.message}`);
        }
    }

    public async handleStripeWebhook(payload: any, signature: string) {
        const event = this.constructEventFromPayload(payload, signature);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;

                console.log('Checkout session successful, emitting event...');
                await this.handleSessionCompleted(session);
                break;

            case 'checkout.session.expired':
                const expiredSession = event.data.object as Stripe.Checkout.Session;
                console.log('Checkout session expired, emitting event...');
                await this.handleSessionExpired(expiredSession);
                break;

            case 'charge.refunded':
                const charge = event.data.object as Stripe.Charge;
                console.log(`Charge ${charge.id} was refunded, emitting event...`);
                await this.handleChargeRefunded(charge);
                break;

            default:
        }
        return { success: true };
    }

    private constructEventFromPayload(payload: Buffer, signature: string): Stripe.Event {
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
        } catch (err) {
            console.error('⚠️  Webhook signature verification failed.', err.message);
            throw new RpcException(`Webhook Error: ${err.message}`);
        }
    }


    private async handleSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {

        const orderId = session.metadata!.orderId;
        const customerId = session.metadata!.user_id;
        this.ordersClient.emit('payment.succeeded', {
            orderId,
            customerId,
            paymentIntentId: session.payment_intent,
        });
    }

    private async handleSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
 
        const orderId = session.metadata!.orderId;
        this.ordersClient.emit('payment.expired', { orderId });
    }

    private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
        console.log(charge)
        const latestRefund = charge.refunds!.data[0];
        if (latestRefund?.metadata?.order_id) {
            const orderId = latestRefund.metadata.order_id;
            this.ordersClient.emit('payment.refunded', {
                orderId,
                refundId: latestRefund.id,
                amountRefunded: latestRefund.amount,
            });
        }
    }
}
