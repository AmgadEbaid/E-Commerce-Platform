import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NatsClientModule } from 'src/nats-client/nats-client.module';
import { MailModule } from 'src/sendgrid/sendgrid.module';

@Module({
  imports: [NatsClientModule,MailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService]
})
export class NotificationsModule { }
