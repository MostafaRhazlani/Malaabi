import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { LoginDto } from './dtos/login-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OAuthProfile } from './interfaces/oauth-profile-interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getTokens(userId: string, email: string | null, role: string) {
    const payload = { sub: userId, email, role };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { sub: payload.sub },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.updateRefreshToken(userId, hash);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password || '',
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return {
      message: 'User found',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!rtMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string) {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  async validateOAuthLogin(profile: OAuthProfile) {
    if (!profile.providerId) {
      throw new UnauthorizedException(
        'Provider ID is required from OAuth provider',
      );
    }

    const userResult = await this.userRepository.upsertOAuthUser({
      provider: profile.provider,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      providerId: profile.providerId,
      picture: profile.picture,
    });

    const tokens = await this.getTokens(
      userResult.id,
      userResult.email,
      userResult.role,
    );
    await this.updateRefreshTokenHash(userResult.id, tokens.refresh_token);

    return {
      message: `${profile.provider} login successful`,
      user: {
        id: userResult.id,
        email: userResult.email,
        role: userResult.role,
      },
      ...tokens,
    };
  }
}
