import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateManagerDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query() query: GetUsersDto,
    @Request() req: ExpressRequest & { user: { user_id: string } },
  ) {
    return this.usersService.findAll(query, req.user.user_id);
  }

  @Post('managers')
  createManager(@Body() dto: CreateManagerDto) {
    return this.usersService.createManager(dto);
  }

  @Delete(':id')
  deleteUser(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { user: { user_id: string } },
  ) {
    return this.usersService.deleteUser(id, req.user.user_id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }
}
