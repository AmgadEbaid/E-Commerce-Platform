import { Module } from '@nestjs/common';
import { MailService } from './sendgrid.service';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}