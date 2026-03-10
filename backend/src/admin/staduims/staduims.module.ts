import { Module } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { StaduimsService } from './staduims.service';
import { StaduimsController } from './staduims.controller';

@Module({
  controllers: [StaduimsController],
  providers: [StaduimsService, JwtAuthGuard, RolesGuard],
})
export class StaduimsModule {}
