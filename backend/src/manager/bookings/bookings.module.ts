import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ManagerBookingsController } from './bookings.controller';
import { ManagerBookingsService } from './bookings.service';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerBookingsController],
  providers: [ManagerBookingsService],
})
export class ManagerBookingsModule {}
