import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject('NATS_SERVICE') private client: ClientProxy) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await lastValueFrom(
      this.client.send({ cmd: 'validateUser' }, { email, password }),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
