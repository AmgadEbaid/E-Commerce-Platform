import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailService } from '../sendgrid/sendgrid.service';
import { MailModule } from '../sendgrid/sendgrid.module';
import { NatsClientModule } from 'src/nats-client/nats-client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MailModule, NatsClientModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, MailService]
})
export class NotificationsModule { }
