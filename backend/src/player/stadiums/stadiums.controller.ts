import { Controller, Get, Query } from '@nestjs/common';
import { StadiumType } from 'generated/prisma/enums';
import { PlayerStadiumsService } from './stadiums.service';

@Controller('stadiums')
export class PlayerStadiumsController {
  constructor(private readonly stadiumsService: PlayerStadiumsService) {}

  @Get()
  findAll(@Query('type') type?: StadiumType) {
    return this.stadiumsService.findAll(type);
  }
}
