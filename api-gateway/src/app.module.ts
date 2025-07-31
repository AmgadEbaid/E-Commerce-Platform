import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsClientModule } from './nats-client/nats-client.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [NatsClientModule, AuthModule,UsersModule, ConfigModule.forRoot({
    isGlobal: true,
  }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
