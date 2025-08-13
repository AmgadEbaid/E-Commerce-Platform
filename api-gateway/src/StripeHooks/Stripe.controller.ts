import { Controller, Post, Headers, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {

    try {
      await this.stripeService.handleStripeWebhook((request as any).rawBody, signature);
      response.status(HttpStatus.OK).json({ received: true });
    } catch (err) {
      response.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }
  }
}