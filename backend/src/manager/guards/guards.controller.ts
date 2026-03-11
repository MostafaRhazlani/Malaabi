import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { AssignGuardDto } from './dto/assign-guard.dto';
import { CreateGuardDto } from './dto/create-guard.dto';
import { ManagerGuardsService } from './guards.service';

@Controller('manager/guards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerGuardsController {
  constructor(private readonly guardsService: ManagerGuardsService) {}

  @Get()
  findAll(@Request() req: ExpressRequest & { user: AuthenticatedUser }) {
    return this.guardsService.findAll(req.user.user_id);
  }

  @Post()
  create(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Body() dto: CreateGuardDto,
  ) {
    return this.guardsService.create(req.user.user_id, dto);
  }

  @Patch(':id/assign')
  assign(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Param('id') guardId: string,
    @Body() dto: AssignGuardDto,
  ) {
    return this.guardsService.assign(req.user.user_id, guardId, dto);
  }

  @Delete(':id')
  remove(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Param('id') guardId: string,
  ) {
    return this.guardsService.remove(req.user.user_id, guardId);
  }
}
