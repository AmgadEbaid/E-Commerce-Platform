import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { VercelBlobModule } from '../vercelBlob/vercelBlob.module';
import { MulterModule } from '@nestjs/platform-express';
import { Address } from '../../entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Address]),
    VercelBlobModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}