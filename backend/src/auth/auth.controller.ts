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
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import { RegisterDto } from './dtos/register.dto';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenPayload } from './interfaces/auth.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token, user, message } =
      await this.authService.register(registerDto);
    this.setCookies(response, access_token, refresh_token);
    return { message, user, access_token, refresh_token };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token, user, message } =
      await this.authService.login(loginDto);

    this.setCookies(response, access_token, refresh_token);

    return { message, user, access_token, refresh_token };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() request: Request,
    @Body('refresh_token') bodyRefreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Accept refresh token from body (mobile) or cookie (web)
    const refreshToken =
      bodyRefreshToken ||
      (request.cookies?.['refresh_token'] as string | undefined);
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

      return {
        message: 'Tokens refreshed properly',
        access_token,
        refresh_token,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
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
  @UseGuards(JwtAuthGuard)
  getMe(@Req() request: Request & { user: AuthenticatedUser }) {
    return { user: request.user };
  }
}
