import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { StripeModule } from 'src/stripeModule/stripe.module';
import { NatsClientModule } from 'src/nats-client/nats-client.module';

@Module({
  
  imports: [StripeModule.forRootAsync(), NatsClientModule],
  controllers: [PaymentController],
  providers: [],
})
export class PaymentModule {}
