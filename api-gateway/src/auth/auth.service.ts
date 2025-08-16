import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { SignInDto } from './dto/signin.dto';
import { CreateOtpDto } from './dto/create-otp.dto';
import { Otp } from 'src/entities/otp.entity';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(@Inject('NATS_SERVICE') private client: ClientProxy) {}

  // todo redirct to verfie email page after registration and return token upon verification
  register(registerUserDto: RegisterUserDto) {
    return this.client.send({ cmd: 'register' }, registerUserDto).pipe(
      catchError((err: any) => {
        console.error('Registration error:', err);
        return throwError(
          () => new ConflictException(err.message || 'Email already exists'),
        );
      }),
    );
  }

  signin(signInDto: SignInDto) {
    return this.client.send({ cmd: 'signin' }, signInDto).pipe(
      catchError((err: any) => {
        console.error('Sign-in error:', err);
        return throwError(
          () => new ConflictException(err.message || 'Invalid credentials'),
        );
      }),
    );
  }

  async googleAuthRedirect(user: any) {
    const token = await lastValueFrom(this.client.send({ cmd: 'login' }, user));
    return {
      url: `http://localhost:3000/auth?token=${token}`,
      statusCode: 302,
    };
  }

  async sendEmailVerificationEmail(email: CreateOtpDto) {
    const token: Otp = await lastValueFrom(
      this.client.send({ cmd: 'create-email-verification-otp' }, email),
    );
    const payload: EmailVerificationDto = {
      email: email.email,
      otc: token.code,
    };

    return this.client
      .send({ cmd: 'sendEmailVerificationEmail' }, payload)
      .pipe(
        catchError((err: any) => {
          console.error('Email verification error:', err);
          return throwError(
            () =>
              new ConflictException(err.message || 'Invalid or expired OTP'),
          );
        }),
      );
  }

  verifyEmail(verifyEmailDto: VerifyEmailDto) {
    console.log('Verifying email:', verifyEmailDto);
    return this.client.send({ cmd: 'verify-email' }, verifyEmailDto).pipe(
      catchError((err: any) => {
        console.error('Email verification error:', err);
        return throwError(
          () => new ConflictException(err.message || 'Invalid or expired OTP'),
        );
      }),
    );
  }

  async sendPasswordRestEmail(email: CreateOtpDto) {
    const token: any = await lastValueFrom(
      this.client.send({ cmd: 'create-password-reset-otp' }, email),
    );
    const payload: EmailVerificationDto = {
      email: email.email,
      otc: token,
    };
    return this.client.send({ cmd: 'sendPasswordRestEmail' }, payload).pipe(
      catchError((err: any) => {
        console.error('Email verification error:', err);
        return throwError(
          () => new ConflictException(err.message || 'Invalid or expired OTP'),
        );
      }),
    );
  }

  resetPassword(resetPasswordDto: any) {
    console.log('Verifying email:', resetPasswordDto);
    return this.client.send({ cmd: 'reset-password' }, resetPasswordDto).pipe(
      catchError((err: any) => {
        console.error('Email verification error:', err);
        return throwError(
          () => new ConflictException(err.message || 'Invalid or expired OTP'),
        );
      }),
    );
  }
}
