import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PlayerStadiumsController } from './stadiums/stadiums.controller';
import { PlayerStadiumsService } from './stadiums/stadiums.service';
import { TeamsModule } from './teams/teams.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [PrismaModule, TeamsModule, WalletModule],
  controllers: [PlayerStadiumsController],
  providers: [PlayerStadiumsService],
})
export class PlayerModule {}
