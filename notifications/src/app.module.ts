import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { NatsClientModule } from './nats-client/nats-client.module';
import { MailModule } from './sendgrid/sendgrid.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), NotificationsModule,NatsClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
