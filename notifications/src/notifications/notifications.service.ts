import { Injectable } from '@nestjs/common';
import { MailService } from '../sendgrid/sendgrid.service';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { ConfigService } from '@nestjs/config';
import { Order } from 'entities/orders.entity';

import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class NotificationsService {
    constructor(private readonly mailService: MailService, private readonly configService: ConfigService) { }

    async sendEmailVerification(emailVerificationDto: any): Promise<void> {
        const { email, otc } = emailVerificationDto;

        console.log('Sending email verification to:', emailVerificationDto);

        const subject = 'Your verification code for E-Commerce Platform';
        const templatePath = path.join(
            process.cwd(),
            'src',
            'notifications',
            'templates',
            'emails',
            'email-verfy.hbs',
        );


        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateSource);

        const html = template({
            email,
            otc
        });


        await this.mailService.sendEmail(email, subject, html);
    }


    async sendPasswordRest(emailVerificationDto: EmailVerificationDto): Promise<void> {

        const { email, otc } = emailVerificationDto;

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        // otc is a jwt token 
        const resetLink = `${frontendUrl}/reset-password?token=${otc}`;

        const subject = 'Your password reset code for E-Commerce Platform';
        const templatePath = path.join(
            process.cwd(),
            'src',
            'notifications',
            'templates',
            'emails',
            'password-reset.hbs',
        );


        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateSource);

        const html = template({
            email,
            resetLink
        });


        await this.mailService.sendEmail(email, subject, html);
    }


    async sendOrderPaidNotification(data: any): Promise<void> {
        const templatePath = path.join(
            process.cwd(),
            'src',
            'notifications',
            'templates',
            'emails',
            'order-paid.hbs',
        );


        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateSource);

        const html = template({
            ...data.order
        });

        const subject = `✔️ Order Confirmed! Your Order #${data.order.id} is being processed.`;

        console.log(data.order)


        console.log(data.order.userEmail)

        await this.mailService.sendEmail(data.order.userEmail, subject, html);

    }
    async sendOrderCancelledNotification(data: any): Promise<void> {
        const templatePath = path.join(
            process.cwd(),
            'src',
            'notifications',
            'templates',
            'emails',
            'order-cancelled.hbs',
        );

        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateSource);

        const html = template({
            ...data.order
        });

        const subject = ` ❌ Your order #${data.order.id} has been cancelled.`;

        await this.mailService.sendEmail(data.order.userEmail, subject, html);
    }
    async sendOrderRefundedNotification(data: any): Promise<void> {
        const templatePath = path.join(
            process.cwd(),
            'src',
            'notifications',
            'templates',
            'emails',
            'order-refunded.hbs',
        );

        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateSource);

        const html = template({
            ...data.order
        });

        const subject = `❕ Your refund for order #${data.order.id} has been processed.`;

        await this.mailService.sendEmail(data.order.userEmail, subject, html);
    }


        async sendOrdershippedNotification(data: any): Promise<void> {
        const templatePath = path.join(
            process.cwd(),
            'src',
            'notifications',
            'templates',
            'emails',
            'order-shipped.hbs',
        );


        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateSource);

        const html = template({
            ...data.order
        });

        const subject = `📦 Your order #${data.order.id} has been shipped.`;

        console.log(data.order)


        console.log(data.order.userEmail)

        await this.mailService.sendEmail(data.order.userEmail, subject, html);

    }


    async sendOrderDeliveredNotification(data: any): Promise<void> {
        const templatePath = path.join(
            process.cwd(),
            'src',
            'notifications',
            'templates',
            'emails',
            'order-delivered.hbs',
        );

        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateSource);

        const html = template({
            ...data.order
        });

        const subject = `📦 Your order #${data.order.id} has been delivered.`;

        await this.mailService.sendEmail(data.order.userEmail, subject, html);
    }
}
