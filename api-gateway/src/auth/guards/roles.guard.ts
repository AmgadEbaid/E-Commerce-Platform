import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('NATS_SERVICE') private client: ClientProxy,
  ) {
    // The userService is injected to access user roles if needed
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.id) {
      return false;
    }

    const userFromDb = await lastValueFrom(
      this.client.send({ cmd: 'FindUserById' }, user.id),
    );
    if (!userFromDb) {
      return false;
    }
    console.log('User from DB:', userFromDb);

    return requiredRoles.includes(userFromDb.role);
  }
}
