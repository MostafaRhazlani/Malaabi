import { Module } from '@nestjs/common';
import { StatsModule } from './stats/stats.module';
import { StaduimsModule } from './staduims/staduims.module';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [],
  providers: [],
  imports: [StatsModule, StaduimsModule, UsersModule],
})
export class AdminModule {}
