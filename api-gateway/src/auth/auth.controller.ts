import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserDto } from './dto/register-user.dto';
import { SignInDto } from './dto/signin.dto';
import { VerifiedGuard } from './guards/verified.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CreateOtpDto } from './dto/create-otp.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('signin')
  signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Google OAuth initiation
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  googleAuthRedirect(@Request() req: any) {
    return this.authService.googleAuthRedirect(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @Get('IsVerified')
  isVerfied(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('Isadmin')
  @Roles(UserRole.ADMIN)
  isadmin(@Request() req: any) {
    return req.user;
  }

  @Post('sendEmailVerificationEmail')
  sendEmailVerificationEmail(@Body() email: CreateOtpDto) {
    return this.authService.sendEmailVerificationEmail(email);
  }

  @Post('verify-email')
  verifyEmail(@Body() VerifyEmail: VerifyEmailDto) {
    return this.authService.verifyEmail(VerifyEmail);
  }

  @Post('sendPasswordRestEmail')
  sendPasswordRestEmail(@Body() email: CreateOtpDto) {
    return this.authService.sendPasswordRestEmail(email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPassword: any) {
    return this.authService.resetPassword(resetPassword);
  }
}
