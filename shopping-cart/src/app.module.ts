import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { User } from 'entities/user.entity';
import { ShoppingCart } from 'entities/shopping-cart.entity';
import { cartItem } from 'entities/cart-item.entity';
import { Product } from 'entities/product.entity';
import { ShoppingCartController } from './shopping-cart/shopping-cart.controller';
import { Otp } from 'entities/otp.entity';
import { Address } from 'entities/address.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('databasename'),
        password: configService.get<string>('PASSWORD'),
        database: configService.get<string>('DATABASE'),
        entities: [User, ShoppingCart, cartItem, Product, Otp, Address],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ShoppingCartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
