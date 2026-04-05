import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PlayerFavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('player/favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLAYER)
export class PlayerFavoritesController {
  constructor(private readonly favoritesService: PlayerFavoritesService) {}

  @Get()
  async findAll(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.favoritesService.findAll(req.user.user_id);
  }

  @Post(':stadiumId')
  async toggle(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('stadiumId') stadiumId: string,
  ) {
    return this.favoritesService.toggle(req.user.user_id, stadiumId);
  }
}
