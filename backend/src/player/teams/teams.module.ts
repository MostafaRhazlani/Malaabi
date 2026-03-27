import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { UploadModule } from '../../upload/upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [UploadModule, PrismaModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
