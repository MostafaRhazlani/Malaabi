import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ManagerStatsService } from './stats.service';

@Controller('manager/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerStatsController {
  constructor(private readonly statsService: ManagerStatsService) {}

  @Get()
  getStats(@Request() req: ExpressRequest & { user: AuthenticatedUser }) {
    return this.statsService.getStats(req.user.user_id);
  }
}
