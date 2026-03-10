import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetStadiumsDto } from './dto/get-stadiums.dto';
import { StaduimsService } from './staduims.service';

@Controller('admin/stadiums')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StaduimsController {
  constructor(private readonly staduimsService: StaduimsService) {}

  @Get()
  findAll(@Query() query: GetStadiumsDto) {
    return this.staduimsService.findAll(query);
  }
}
