import { Controller, Post, UseGuards, Request, Get, Body, Redirect, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { SignInDto } from './dto/signin.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() registerUserDto: RegisterUserDto) {
    console.log('Registering user:', registerUserDto);
    return this.authService.register(registerUserDto.email, registerUserDto.name,registerUserDto.password);
  }

  @MessagePattern({ cmd: 'signin' })
  async signin(@Payload() signInDto: SignInDto) {
    return this.authService.signin(signInDto.email, signInDto.password);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() RequestUser: any) {
    const { access_token } = await this.authService.login(RequestUser);
    return access_token;
  }

  @MessagePattern({ cmd: 'validateUser' })
  async validateUser(@Payload() RequestUser: SignInDto) {
    const user = await this.authService.validateUser(RequestUser.email, RequestUser.password);
    return user;
  }

  @MessagePattern({ cmd: 'validateGoogleUser' })
  async validateGoogleUser(@Payload() profile: any) {
    const user = await this.authService.validateGoogleUser(profile);
    return user;
  }

}
