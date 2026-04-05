import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';

jest.mock('./auth.service', () => ({
  AuthService: class AuthService {},
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import { RegisterDto } from './dtos/register.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const registerMock: jest.MockedFunction<
    (dto: RegisterDto) => Promise<unknown>
  > = jest.fn();
  const loginMock: jest.MockedFunction<(dto: LoginDto) => Promise<unknown>> =
    jest.fn();
  const logoutMock: jest.MockedFunction<(userId: string) => Promise<void>> =
    jest.fn();
  const refreshTokensMock: jest.MockedFunction<
    (userId: string, refreshToken: string) => Promise<unknown>
  > = jest.fn();
  const verifyAsyncMock: jest.MockedFunction<
    (token: string, options?: { secret?: string }) => Promise<{ sub: string }>
  > = jest.fn();

  const authServiceMock = {
    register: registerMock,
    login: loginMock,
    logout: logoutMock,
    refreshTokens: refreshTokensMock,
  };

  const jwtServiceMock = {
    verifyAsync: verifyAsyncMock,
  };

  const createMockResponse = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  });

  beforeEach(async () => {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  it('registers a player and sets auth cookies', async () => {
    const dto: RegisterDto = {
      firstName: 'Mostafa',
      lastName: 'Rhazlani',
      email: 'player@test.com',
      password: 'password123',
    };

    const registerResult = {
      message: 'User registered successfully',
      user: {
        user_id: 'player-1',
        email: dto.email,
        role: 'PLAYER',
        first_name: dto.firstName,
        last_name: dto.lastName,
        birth_date: null,
        position: null,
        profile_img: null,
      },
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    };

    registerMock.mockResolvedValue(registerResult);

    const response = createMockResponse();
    const result = await controller.register(
      dto,
      response as unknown as Response,
    );

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(response.cookie).toHaveBeenNthCalledWith(
      1,
      'access_token',
      registerResult.access_token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      }),
    );
    expect(response.cookie).toHaveBeenNthCalledWith(
      2,
      'refresh_token',
      registerResult.refresh_token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(result.user.role).toBe('PLAYER');
    expect(result).toEqual(registerResult);
  });

  it('logs in a player and sets auth cookies', async () => {
    const dto: LoginDto = {
      email: 'player@test.com',
      password: 'password123',
    };

    const loginResult = {
      message: 'User found',
      user: {
        user_id: 'player-1',
        email: dto.email,
        role: 'PLAYER',
        first_name: 'Mostafa',
        last_name: 'Rhazlani',
        birth_date: null,
        position: null,
        profile_img: null,
      },
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    };

    loginMock.mockResolvedValue(loginResult);

    const response = createMockResponse();
    const result = await controller.login(dto, response as unknown as Response);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(result.user.role).toBe('PLAYER');
    expect(result).toEqual(loginResult);
  });

  it('logs out a user, clears cookies, and revokes refresh token', async () => {
    const request = {
      cookies: {
        refresh_token: 'refresh-token',
      },
    };

    verifyAsyncMock.mockResolvedValue({ sub: 'player-1' });
    logoutMock.mockResolvedValue(undefined);

    const response = createMockResponse();
    const result = await controller.logout(
      request as unknown as Request,
      response as unknown as Response,
    );

    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('refresh-token', {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    expect(authServiceMock.logout).toHaveBeenCalledWith('player-1');
    expect(response.clearCookie).toHaveBeenCalledWith('access_token');
    expect(response.clearCookie).toHaveBeenCalledWith('refresh_token');
    expect(result).toEqual({ message: 'Logged out successfully' });
  });
});
