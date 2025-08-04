import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NatsClientModule } from 'src/nats-client/nats-client.module';
import { VercelBlobModule } from 'src/vercelBlob/vercelBlob.module';

@Module({
  imports: [NatsClientModule, VercelBlobModule],
  controllers: [UsersController],
  providers: [],
})
export class UsersModule {}
