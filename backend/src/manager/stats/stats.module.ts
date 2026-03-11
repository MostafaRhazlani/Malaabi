import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ManagerStatsController } from './stats.controller';
import { ManagerStatsService } from './stats.service';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerStatsController],
  providers: [ManagerStatsService],
})
export class ManagerStatsModule {}
