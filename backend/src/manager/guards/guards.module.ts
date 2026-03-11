import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ManagerGuardsController } from './guards.controller';
import { ManagerGuardsService } from './guards.service';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerGuardsController],
  providers: [ManagerGuardsService],
})
export class ManagerGuardsModule {}
