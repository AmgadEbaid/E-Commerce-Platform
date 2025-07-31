import { Controller, Inject } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { CreateOtpDto } from './dto/create-otp.dto';
import { lastValueFrom } from 'rxjs';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService, @Inject('NATS_SERVICE') private client: ClientProxy) { }

    @MessagePattern({ cmd: 'sendEmailVerificationEmail' })
    async createEmailVerificationOtp(@Payload() EmailVerification: EmailVerificationDto) {
        console.log('Creating email verification OTP for:', EmailVerification);
        await this.notificationsService.sendEmailVerification(EmailVerification);
        return {msg: 'Email verification OTP sent successfully'};
    }

    @MessagePattern({ cmd: 'sendPasswordRestEmail' })
    async sendPasswordRest(@Payload() sendPasswordRest: EmailVerificationDto) {
        console.log('Creating password reset OTP for:');
        await this.notificationsService.sendPasswordRest(sendPasswordRest);
        return {msg: 'Password reset email sent successfully'};
    }
}
