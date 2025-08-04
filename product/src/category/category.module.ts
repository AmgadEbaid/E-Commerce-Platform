
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from '../../entities/category.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
