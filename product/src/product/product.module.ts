
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
