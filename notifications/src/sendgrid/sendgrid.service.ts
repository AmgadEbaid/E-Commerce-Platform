// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
        const verifiedSender = this.configService.get<string>('SENDGRID_SENDER_EMAIL');
        if (!apiKey || !verifiedSender) {
            throw new Error('SENDGRID_API_KEY and SENDGRID_SENDER_EMAIL must be set in the environment variables');
        }
        sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY')!);
    }



    async sendEmail(to: string, subject: string, html: string): Promise<void> {
   
        const msg = {
            to,
            from: this.configService.get<string>('SENDGRID_SENDER_EMAIL')!,
            subject,
            html,
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            throw error; // Re-throw the error so the calling service is aware of the failure
        }
    }

    // You can add more methods for sending emails with templates, attachments, etc.
    async sendEmailWithTemplate(to: string, templateId: string, dynamicTemplateData: any): Promise<void> {
        const msg = {
            to,
            from: this.configService.get<string>('SENDGRID_SENDER_EMAIL')!,
            templateId,
            dynamicTemplateData,
        };
        await sgMail.send(msg);
    }
}