import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      provider: 'FACEBOOK',
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      firstName: profile.name?.givenName ?? null,
      lastName: profile.name?.familyName ?? null,
      picture: profile.photos?.[0].value ?? null,
    };
  }
}
