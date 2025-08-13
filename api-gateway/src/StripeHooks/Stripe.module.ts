import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/nats-client/nats-client.module';
import { StripeController } from './Stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [NatsClientModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
