import { Controller, Get } from '@nestjs/common';
import { PlayerStadiumsService } from './stadiums.service';

@Controller('stadiums')
export class PlayerStadiumsController {
  constructor(private readonly stadiumsService: PlayerStadiumsService) {}

  @Get()
  findAll() {
    return this.stadiumsService.findAll();
  }
}
