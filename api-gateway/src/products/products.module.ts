import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { VercelBlobModule } from 'src/vercelBlob/vercelBlob.module';
import { NatsClientModule } from 'src/nats-client/nats-client.module';

@Module({
  imports: [NatsClientModule, VercelBlobModule],
  controllers: [ProductsController],
})
export class ProductsModule {}
