// In your Payments Microservice -> stripe.service.ts

import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class StripeService {
  private readonly webhookSecret: string;

  constructor(@Inject('NATS_SERVICE') private Client: ClientProxy) { }

  async handleStripeWebhook(payload: Buffer, signature: string) {

    console.log('Handling Stripe webhook...');

    return await lastValueFrom(
      this.Client.send({ cmd: 'handleStripeWebhook' }, { payload, signature }),
    );
  }


}