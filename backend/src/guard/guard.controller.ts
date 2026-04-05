import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { GuardService } from './guard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('guard')
@UseGuards(JwtAuthGuard)
export class GuardController {
  constructor(private readonly guardService: GuardService) {}

  @Get('bookings')
  findAll(@Request() req: ExpressRequest & { user: AuthenticatedUser }) {
    return this.guardService.findAllBookings(req.user.user_id);
  }

  @Post('verify')
  verify(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Body('token') token: string,
  ) {
    return this.guardService.verifyToken(req.user.user_id, token);
  }
}
