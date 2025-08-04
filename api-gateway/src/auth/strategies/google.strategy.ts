import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  VerifyCallback,
  StrategyOptionsWithRequest,
} from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('NATS_SERVICE') private client: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await lastValueFrom(
      this.client.send({ cmd: 'validateGoogleUser' }, profile),
    );
    done(null, user);
  }
}
