import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OtpService } from './otp.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Login2faDto } from './dto/login-2fa.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateOtpDto } from './dto/create-otp.dto';
import { AuthService } from 'src/auth/auth.service';
import { lastValueFrom } from 'rxjs';

@Controller()
export class OtpController {
  constructor(private readonly otpService: OtpService, private readonly authService:AuthService) {}

  @MessagePattern({ cmd: 'create-email-verification-otp' })
  createEmailVerificationOtp(@Payload() createOtpDto: CreateOtpDto) {
    return this.otpService.createEmailVerificationOtp(createOtpDto.email);
  }

  @MessagePattern({ cmd: 'create-login-2fa-otp' })
  createLogin2faOtp(@Payload() createOtpDto: CreateOtpDto) {
    return this.otpService.createLogin2faOtp(createOtpDto.email);
  }

  @MessagePattern({ cmd: 'create-password-reset-otp' })
  async createPasswordResetOtp(@Payload() createOtpDto: CreateOtpDto) {  
    return this.authService.createPasswordResetToken(createOtpDto.email)
  }

  @MessagePattern({ cmd: 'verify-email' })
  verifyEmail(@Payload() verifyEmailDto: VerifyEmailDto) {
    console.log('Verifying email:', verifyEmailDto);
    return this.otpService.verifyEmail(verifyEmailDto.email, verifyEmailDto.code);
  }

  @MessagePattern({ cmd: 'login-2fa' })
  loginWith2fa(@Payload() login2faDto: Login2faDto) {
    return this.otpService.loginWith2fa(login2faDto.code);
  }

  @MessagePattern({ cmd: 'reset-password' })
  resetPassword(@Payload() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.code,
      resetPasswordDto.newPassword,
    );
  }
}
