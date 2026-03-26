import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetPlayerStadiumsDto } from './dto/get-player-stadiums.dto';
import { PlayerStadiumsService } from './stadiums.service';

@Controller('player/stadiums')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLAYER)
export class PlayerStadiumsController {
  constructor(private readonly stadiumsService: PlayerStadiumsService) {}

  @Get()
  findAll(@Query() query: GetPlayerStadiumsDto) {
    return this.stadiumsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const stadium = await this.stadiumsService.findOne(id);
    if (!stadium) throw new NotFoundException('Stadium not found');
    return stadium;
  }
}
