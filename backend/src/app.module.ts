import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { ManagerModule } from './manager/manager.module';
import { UploadModule } from './upload/upload.module';
import { PlayerModule } from './player/player.module';
import { GuardModule } from './guard/guard.module';

@Module({
  imports: [
    PrismaModule,
    UploadModule,
    UserModule,
    AuthModule,
    AdminModule,
    ManagerModule,
    PlayerModule,
    GuardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
