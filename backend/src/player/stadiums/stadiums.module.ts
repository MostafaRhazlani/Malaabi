import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PlayerStadiumsController } from './stadiums.controller';
import { PlayerStadiumsService } from './stadiums.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlayerStadiumsController],
  providers: [PlayerStadiumsService],
})
export class PlayerStadiumsModule {}
