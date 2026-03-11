import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [EmailModule],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard, RolesGuard],
})
export class UsersModule {}
