import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { OAuthProfile } from 'src/auth/interfaces/oauth-profile.interface';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refresh_token: refreshToken },
    });
  }

  async upsertOAuthUser(profile: OAuthProfile) {
    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      return existingAccount.user;
    }

    return this.prisma.user.create({
      data: {
        email: null,
        first_name: profile.firstName ?? '',
        last_name: profile.lastName ?? '',
        profile_img: profile.picture ?? null,
        role: Role.PLAYER,
        oauthAccounts: {
          create: {
            provider: profile.provider,
            providerId: profile.providerId,
          },
        },
      },
    });
  }
}
