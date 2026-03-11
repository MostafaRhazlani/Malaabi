import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ManagerStadiumsController } from './stadiums.controller';
import { ManagerStadiumsService } from './stadiums.service';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerStadiumsController],
  providers: [ManagerStadiumsService],
})
export class ManagerStadiumsModule {}
