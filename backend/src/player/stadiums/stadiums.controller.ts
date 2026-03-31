import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role, StadiumType } from 'generated/prisma/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PlayerStadiumsService } from './stadiums.service';

@Controller('stadiums')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLAYER)
export class PlayerStadiumsController {
  constructor(private readonly stadiumsService: PlayerStadiumsService) {}

  @Get('search')
  search(@Query('q') query?: string) {
    return this.stadiumsService.search(query);
  }

  @Get()
  findAll(@Query('type') type?: StadiumType) {
    return this.stadiumsService.findAll(type);
  }
}
