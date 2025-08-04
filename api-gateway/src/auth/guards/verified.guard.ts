import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('NATS_SERVICE') private client: ClientProxy,
  ) {
    // The userService is injected to access user roles if needed
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Checking if user is verified...');

    const { user } = context.switchToHttp().getRequest();
    if (!user?.id) {
      return false;
    }
    console.log('User ID:', user.id);

    const userFromDb = await lastValueFrom(
      this.client.send({ cmd: 'FindUserById' }, user.id),
    );
    if (!userFromDb) {
      return false;
    }
    console.log('User is verified:', userFromDb.isVerified);

    return userFromDb.isVerified;
  }
}
