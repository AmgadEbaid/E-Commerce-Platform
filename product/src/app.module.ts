import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { Product } from '../entities/product.entity';
import { CategoryModule } from './category/category.module';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
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
        entities: [Product, Category, User,Otp,Address],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ProductModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

