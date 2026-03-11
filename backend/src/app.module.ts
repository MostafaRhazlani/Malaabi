import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { ManagerModule } from './manager/manager.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule, UserModule, AuthModule, AdminModule, ManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
