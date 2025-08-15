import { Controller, Inject } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClientProxy, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { CreateOtpDto } from './dto/create-otp.dto';
import { lastValueFrom } from 'rxjs';
import { Order } from 'entities/orders.entity';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService, @Inject('NATS_SERVICE') private client: ClientProxy) { }

    @MessagePattern({ cmd: 'sendEmailVerificationEmail' })
    async createEmailVerificationOtp(@Payload() EmailVerification: EmailVerificationDto) {
        console.log('Creating email verification OTP for:', EmailVerification);
        await this.notificationsService.sendEmailVerification(EmailVerification);
        return { msg: 'Email verification OTP sent successfully' };
    }

    @MessagePattern({ cmd: 'sendPasswordRestEmail' })
    async sendPasswordRest(@Payload() sendPasswordRest: EmailVerificationDto) {
        console.log('Creating password reset OTP for:');
        await this.notificationsService.sendPasswordRest(sendPasswordRest);
        return { msg: 'Password reset email sent successfully' };
    }


    @EventPattern('order.refunded')
    async orderRefunded(@Payload() order: Order) {
        this.notificationsService.sendOrderRefundedNotification(order);
    }

    @EventPattern('order.cancelled')
    async orderCancelled(@Payload() order: Order) {
        this.notificationsService.sendOrderCancelledNotification(order);

    }

    @EventPattern('order.paid')
    async orderPaid(@Payload() order: Order) {
        this.notificationsService.sendOrderPaidNotification(order);

    }

}
