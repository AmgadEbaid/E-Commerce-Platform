import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShoppingCartController } from './shopping-cart.controller';
import { ShoppingCartService } from './shopping-cart.service';
import { NatsClientModule } from 'src/nats-client/nats-client.module';

@Module({
  imports: [NatsClientModule],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
  exports: [ShoppingCartService],
})
export class ShoppingCartModule {}
