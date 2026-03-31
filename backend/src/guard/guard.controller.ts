import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GuardService } from './guard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guard')
@UseGuards(JwtAuthGuard)
export class GuardController {
  constructor(private readonly guardService: GuardService) {}

  @Get('bookings')
  findAll(@Request() req) {
    return this.guardService.findAllBookings(req.user.user_id);
  }

  @Post('verify')
  verify(
    @Request() req,
    @Body('token') token: string
  ) {
    return this.guardService.verifyToken(req.user.user_id, token);
  }
}
