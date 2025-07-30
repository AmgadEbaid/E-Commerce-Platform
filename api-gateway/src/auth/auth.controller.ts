import { Controller, Post, UseGuards, Request, Get, Body, Redirect, Inject, ConflictException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserDto } from './dto/register-user.dto';
import { SignInDto } from './dto/signin.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { VerifiedGuard } from './guards/verified.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(@Inject('NATS_SERVICE') private client: ClientProxy) { }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.client.send({ cmd: 'register' }, registerUserDto).pipe(catchError(err => {
      console.error('Registration error:', err);
      return throwError(() => new ConflictException(err.message || 'Email already exists'));
    }));
    
      
  }

  @Post('signin')
  async signin(@Body() signInDto: SignInDto) {
    return this.client.send({ cmd: 'signin' }, signInDto).pipe(catchError(err => {
      console.error('Sign-in error:', err);
      return throwError(() => new ConflictException(err.message || 'Invalid credentials'));
    }));
  }



  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth initiation
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthRedirect(@Request() req) {
    const token = await lastValueFrom(this.client.send({ cmd: 'login' }, req.user))
    return {
      url: `http://localhost:3000/auth?token=${token}`,
      statusCode: 302
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @Get('IsVerified')
  isVerfied(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)

  @Get('Isadmin')
  @Roles(UserRole.ADMIN)
  isadmin(@Request() req) {
    return req.user;
  }
}
