import { Module } from '@nestjs/common';
import { PlayerFavoritesController } from './favorites.controller';
import { PlayerFavoritesService } from './favorites.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlayerFavoritesController],
  providers: [PlayerFavoritesService],
  exports: [PlayerFavoritesService],
})
export class PlayerFavoritesModule {}
