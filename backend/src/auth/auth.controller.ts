import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenPayload } from './interfaces/auth.interface';
import { OAuthProfile } from './interfaces/oauth-profile.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  private setCookies(
    response: Response,
    access_token: string,
    refresh_token: string,
  ) {
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Return JWT token in httpOnly cookie.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token, user, message } =
      await this.authService.login(loginDto);

    this.setCookies(response, access_token, refresh_token);

    return { message, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Return new JWT tokens.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      const userId = payload.sub;
      const { access_token, refresh_token } =
        await this.authService.refreshTokens(userId, refreshToken);
      this.setCookies(response, access_token, refresh_token);

      return { message: 'Tokens refreshed properly' };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful and cookies cleared.',
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'] as string | undefined;

    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshToken,
          {
            secret: process.env.JWT_REFRESH_SECRET,
          },
        );
        await this.authService.logout(payload.sub);
      } catch (e) {
        console.log(e);
      }
    }

    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLAYER)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Return current user info.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMe(@Req() request: Request & { user: AuthenticatedUser }) {
    return { user: request.user };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google login' })
  googleAuth() {
    return { message: 'Google authentication' };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google login callback' })
  async googleAuthRedirect(
    @Req() request: Request & { user: OAuthProfile },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token, user, message } =
      await this.authService.validateOAuthLogin(request.user);

    this.setCookies(response, access_token, refresh_token);
    return { message, user };
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook login' })
  facebookAuth() {
    return { message: 'Facebook authentication' };
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook login callback' })
  async facebookAuthRedirect(
    @Req() request: Request & { user: OAuthProfile },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token, user, message } =
      await this.authService.validateOAuthLogin(request.user);

    this.setCookies(response, access_token, refresh_token);
    return { message, user };
  }
}
