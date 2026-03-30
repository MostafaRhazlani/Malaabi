import { Controller, Get, Post, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { PlayerFavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('player/favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLAYER)
export class PlayerFavoritesController {
  constructor(private readonly favoritesService: PlayerFavoritesService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.favoritesService.findAll(req.user.user_id);
  }

  @Post(':stadiumId')
  async toggle(@Req() req: any, @Param('stadiumId') stadiumId: string) {
    return this.favoritesService.toggle(req.user.user_id, stadiumId);
  }
}
