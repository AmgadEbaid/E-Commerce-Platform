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
        const html = `<div style="background-color: #f7f7f7; font-family: Arial, sans-serif; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <!-- Optional: Add your logo here -->
        <!-- <img src="your_logo_url_here" alt="[Your App Name] Logo" style="max-width: 150px; margin-bottom: 20px;"> -->
        
        <h1 style="color: #333333; font-size: 24px;">Confirm Your Account</h1>
        
        <p style="color: #555555; font-size: 16px;">
            Hi there,
        </p>
        
        <p style="color: #555555; font-size: 16px;">
            Your one-time verification code is below. Please enter it on the verification page to continue.
        </p>
        
        <div style="background-color: #eef2ff; border: 1px dashed #c7d2fe; border-radius: 8px; text-align: center; padding: 20px; margin: 30px 0;">
            <p style="color: #4338ca; font-size: 36px; font-weight: bold; letter-spacing: 0.3em; margin: 0; text-align: center;">
                ${otc}
            </p>
        </div>
        
        <p style="color: #555555; font-size: 16px;">
            For your security, this code will expire in <strong>10 minutes</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
        
        <p style="color: #888888; font-size: 12px; text-align: center;">
            If you didn't request this, you can disregard this email. Your account is secure.
            <br>
            © 2025 [Your App Name]. All rights reserved.
        </p>
    
    </div>
</div>`;
        await this.mailService.sendEmail(email, subject, html);
    }


    async sendPasswordRest(emailVerificationDto: EmailVerificationDto): Promise<void> {

        const { email, otc } = emailVerificationDto;

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        // otc is a jwt token 
        const resetLink = `${frontendUrl}/reset-password?token=${otc}`;

        const subject = 'Your password reset code for E-Commerce Platform';
        const html = `<div style="background-color: #f7f7f7; font-family: Arial, sans-serif; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <h1 style="color: #333333; font-size: 24px;">Reset Your Password</h1>
        
        <p style="color: #555555; font-size: 16px;">
            Hello ${email},
        </p>
        
        <p style="color: #555555; font-size: 16px;">
            We received a request to reset the password for your E-commerce platform account. Please click the button below to choose a new password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4338ca; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">Reset Your Password</a>
        </div>
        
        <p style="color: #555555; font-size: 16px;">
            For your security, this link will expire in <strong>10 minutes</strong>.
        </p>

        <p style="color: #555555; font-size: 16px; text-align: center;">
            If the button above doesn't work, please copy and paste this link into your browser: <br> <a href="${resetLink}" style="color: #4338ca;">${resetLink}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
        
        <p style="color: #888888; font-size: 14px;">
            If you did not request a password reset, you can safely ignore this email. No changes have been made to your account.
        </p>
    
    </div>
</div>`;
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
}
