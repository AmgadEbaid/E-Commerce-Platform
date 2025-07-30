import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserService } from 'src/user/user.service';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private reflector: Reflector,private readonly userService: UserService) {
    // The userService is injected to access user roles if needed
    
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.id) {
      return false;
    }

    const userFromDb = await this.userService.findById(user.id);
    if (!userFromDb) {
      return false;
    }

    return user && user.isVerified;
  }
}