import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { PlayerBookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('player/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLAYER)
export class PlayerBookingsController {
  constructor(private readonly bookingsService: PlayerBookingsService) {}

  @Post()
  create(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(req.user.user_id, createBookingDto);
  }

  @Get()
  findAll(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.bookingsService.findAll(req.user.user_id);
  }

  @Get('slots')
  getTakenSlots(
    @Query('stadiumId') stadiumId: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.bookingsService.getTakenSlots(
      stadiumId,
      date,
      startDate,
      endDate,
    );
  }

  @Post(':id/cancel')
  cancel(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('id') id: string,
  ) {
    return this.bookingsService.cancel(req.user.user_id, id);
  }
}
