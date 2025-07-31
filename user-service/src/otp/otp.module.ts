import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from '../../entities/otp.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), AuthModule, UserModule],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
