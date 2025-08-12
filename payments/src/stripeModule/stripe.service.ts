// src/stripe/stripe.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Order } from 'entities/orders.entity';
import { Stripe } from 'stripe';

@Injectable()
export class StripeService {
    constructor(@Inject('STRIPE_CLIENT') private readonly stripe: Stripe) { }

    async CreatPaymentSessions(order: Order) {
        const YOUR_DOMAIN = 'http://localhost:3001'; 
        const lineItems = this.createStripeLineItems(order, 'usd');

        const session = await this.stripe.checkout.sessions.create({
            line_items: lineItems,
            metadata: {
                reservation_id: order.id,
                user_id: order.userId,
            },
            success_url: `${YOUR_DOMAIN}/success.html`,
            cancel_url: `${YOUR_DOMAIN}/cancel.html`,
            mode: 'payment',
        });

        return session;
    }

    private createStripeLineItems = (order: Order, currency: string = 'usd'): Stripe.Checkout.SessionCreateParams.LineItem[] => {
        if (!order || !order.items || order.items.length === 0) {
            throw new RpcException('Order must have at least one item.');
        }

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => {

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






}