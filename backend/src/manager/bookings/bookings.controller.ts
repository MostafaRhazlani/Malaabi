import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ManagerBookingsService } from './bookings.service';
import { GetBookingsDto } from './dto/get-bookings.dto';

@Controller('manager/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerBookingsController {
  constructor(private readonly bookingsService: ManagerBookingsService) {}

  @Get()
  findAll(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Query() query: GetBookingsDto,
  ) {
    return this.bookingsService.findAll(req.user.user_id, query);
  }
}
