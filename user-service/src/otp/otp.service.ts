import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp, OtpPurpose } from '../../entities/otp.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { User } from '../../entities/user.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  private async createOtp(user: User, purpose: OtpPurpose): Promise<Otp> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otp = this.otpRepository.create({
      userId: user.id,
      user,
      code,
      purpose,
      expiresAt,
    });

    return this.otpRepository.save(otp);
  }

  async createEmailVerificationOtp(email: string): Promise<Otp> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }
    return this.createOtp(user, OtpPurpose.EMAIL_VERIFICATION);
  }

  async createLogin2faOtp(email: string): Promise<Otp> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }
    return this.createOtp(user, OtpPurpose.LOGIN_2FA);
  }

  async createPasswordResetOtp(email: string): Promise<Otp> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }
    return this.createOtp(user, OtpPurpose.PASSWORD_RESET);
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }

    const otp = await this.otpRepository.findOne({
      where: { userId: user.id, code, purpose: OtpPurpose.EMAIL_VERIFICATION },
    });

    if (!otp || otp.used || otp.expiresAt < new Date()) {
      throw new RpcException('Invalid or expired OTP');
    }

    user.isVerified = true;
    otp.used = true;

    await this.userService.save(user);
    await this.otpRepository.save(otp);
    return { success: true, message: 'Data processed successfully' };

  }

  async loginWith2fa(code: string): Promise<{ access_token: string }> {
    const otp = await this.otpRepository.findOne({
      where: { code, purpose: OtpPurpose.LOGIN_2FA },
      relations: ['user'],
    });

    if (!otp || otp.used || otp.expiresAt < new Date()) {
      throw new RpcException('Invalid or expired OTP');
    }

    otp.used = true;
    await this.otpRepository.save(otp);

    return this.authService.login(otp.user);

  }

  async resetPassword(code: string, newPassword: string) {
    const otp = await this.otpRepository.findOne({
      where: { code, purpose: OtpPurpose.PASSWORD_RESET },
      relations: ['user'],
    });

    if (!otp || otp.used || otp.expiresAt < new Date()) {
      throw new RpcException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    otp.user.password = hashedPassword;
    otp.used = true;

    await this.userService.save(otp.user);
    await this.otpRepository.save(otp);
    return { success: true, message: 'Data processed successfully' };

  }
}
