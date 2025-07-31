import { Injectable } from '@nestjs/common';
import { MailService } from '../sendgrid/sendgrid.service';
import { EmailVerificationDto } from './dto/email-verification.dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly mailService: MailService) { }

    async sendEmailVerification(emailVerificationDto: any): Promise<void> {
        const { email, code } = emailVerificationDto;
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
                ${code}
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
        console.log(email.email,code);
        await this.mailService.sendEmail(email.email, subject, html);
    }


    async sendPasswordRest(emailVerificationDto: EmailVerificationDto): Promise<void> {
        const { email, otc } = emailVerificationDto;
        const subject = 'Your password reset code for E-Commerce Platform';
        const html = `<div style="background-color: #f7f7f7; font-family: Arial, sans-serif; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <h1 style="color: #333333; font-size: 24px;">Your Password Reset Code</h1>
        
        <p style="color: #555555; font-size: 16px;">
            Hello ${email},
        </p>
        
        <p style="color: #555555; font-size: 16px;">
            We received a request to reset the password for your E-commerce platform account. Please enter the code below on the password reset page to proceed.
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
        
        <p style="color: #888888; font-size: 14px;">
            If you did not request a password reset, you can safely ignore this email. No changes have been made to your account.
        </p>
    
    </div>
</div>`;
        await this.mailService.sendEmail(email, subject, html);
    }
}
