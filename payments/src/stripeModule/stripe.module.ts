// src/stripe/stripe.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { StripeService } from './stripe.service';

@Module({})
export class StripeModule {
    static forRootAsync(): DynamicModule {
        return {
            module: StripeModule,
            imports: [ConfigModule],
            providers: [
                {
                    provide: 'STRIPE_CLIENT',
                    useFactory: (configService: ConfigService) => {
                        if (!configService.get('STRIPE_SECRET_KEY')) {
                            throw new Error('Stripe secret key is not defined in the environment variables');
                        }
                        return new Stripe(configService.get('STRIPE_SECRET_KEY')!);
                    },
                    inject: [ConfigService],
                },
                StripeService,
            ],
            exports: [StripeService],

        };
    }
}