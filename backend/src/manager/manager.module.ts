import { Module } from '@nestjs/common';
import { ManagerBookingsModule } from './bookings/bookings.module';
import { ManagerGuardsModule } from './guards/guards.module';
import { ManagerStadiumsModule } from './stadiums/stadiums.module';
import { ManagerStatsModule } from './stats/stats.module';

@Module({
  imports: [
    ManagerStatsModule,
    ManagerStadiumsModule,
    ManagerGuardsModule,
    ManagerBookingsModule,
  ],
})
export class ManagerModule {}
