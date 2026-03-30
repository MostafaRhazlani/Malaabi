import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PlayerBookingsController } from './bookings.controller';
import { PlayerBookingsService } from './bookings.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlayerBookingsController],
  providers: [PlayerBookingsService],
  exports: [PlayerBookingsService],
})
export class PlayerBookingsModule {}
