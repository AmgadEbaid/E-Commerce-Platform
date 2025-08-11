import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { RpcException } from '@nestjs/microservices';

interface JwtPayload {
  email: string;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string,name:string): Promise<{ access_token: string }> {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new RpcException('Email already exists');
    }
    const user = await this.userService.create(email, name ,password);
    return this.login(user);
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    if (!email || !password) {
      throw new RpcException('Email and password are required');
    }

    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async signin(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new RpcException('Invalid credentials');
    }
    return this.login(user);
  }

  async login(user: Omit<User, 'password'>) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

   async validateGoogleUser(profile): Promise<User> {
    if (!profile || !profile.id || !profile.emails || profile.emails.length === 0) {
      throw new RpcException('Invalid Google profile');
    }
    console.log("iam here ")
    console.log("iam here ")
    console.log(profile)

    const email = profile.emails[0].value;
    if (!email) {
      throw new RpcException('Email is required from Google profile');
    }

    let user = await this.userService.findByGoogleId(profile.id);
    
    if (!user) {
      user = await this.userService.findByEmail(email);
      
      if (user) {
        user.googleId = profile.id;
        await this.userService.save(user);
      } else {
        user = await this.userService.create(email,profile.displayName,profile.id);
        user.isVerified = true; // Automatically verify new users from Google
        user.profilePicture = profile.photos[0].value
        await this.userService.save(user);
      }
    }
    
    return user;
  }

  async createPasswordResetToken(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }
    const payload = { email: user.email, sub: user.id };
    const reset_token = this.jwtService.sign(payload, { expiresIn: '10m' })

    return reset_token
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findByEmail(payload.email);
      if (!user) {
        throw new RpcException('User not found');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userService.update(user.id, { password: hashedPassword });
    } catch (error) {
      throw new RpcException('Invalid or expired token');
    }
    return {msg:"succuss"}
  }
  
}
