import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetStadiumsDto } from './dto/get-stadiums.dto';
import { UpdateStadiumStatusDto } from './dto/update-stadium-status.dto';
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

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStadiumStatusDto) {
    return this.staduimsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.staduimsService.remove(id);
  }
}
