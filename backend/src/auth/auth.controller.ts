import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) { }

  private setCookies(response: Response, access_token: string, refresh_token: string) {
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
  @ApiResponse({ status: 200, description: 'Return JWT token in httpOnly cookie.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { access_token, refresh_token, user, message } = await this.authService.login(loginDto);

    this.setCookies(response, access_token, refresh_token);

    return { message, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Return new JWT tokens.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshTokens(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const userId = payload.sub;
      const { access_token, refresh_token } = await this.authService.refreshTokens(userId, refreshToken);
      console.log(access_token, refresh_token);
      this.setCookies(response, access_token, refresh_token);

      return { message: 'Tokens refreshed properly' };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
