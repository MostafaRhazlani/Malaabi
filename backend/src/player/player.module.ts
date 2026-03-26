import { Module } from '@nestjs/common';
import { PlayerStadiumsModule } from './stadiums/stadiums.module';

@Module({
  imports: [PlayerStadiumsModule],
})
export class PlayerModule {}
