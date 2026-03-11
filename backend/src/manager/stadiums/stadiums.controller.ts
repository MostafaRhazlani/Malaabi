import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request as ExpressRequest } from 'express';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumPricesDto } from './dto/update-stadium-prices.dto';
import { DeletePhotoDto } from './dto/delete-photo.dto';
import { ManagerStadiumsService } from './stadiums.service';

@Controller('manager/stadiums')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class ManagerStadiumsController {
  constructor(private readonly stadiumsService: ManagerStadiumsService) {}

  @Get()
  findAll(@Request() req: ExpressRequest & { user: AuthenticatedUser }) {
    return this.stadiumsService.findAll(req.user.user_id);
  }

  @Post()
  create(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Body() dto: CreateStadiumDto,
  ) {
    return this.stadiumsService.create(req.user.user_id, dto);
  }

  @Patch(':id/prices')
  updatePrices(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Param('id') id: string,
    @Body() dto: UpdateStadiumPricesDto,
  ) {
    return this.stadiumsService.updatePrices(req.user.user_id, id, dto);
  }

  @Post(':id/photos')
  @UseInterceptors(
    FilesInterceptor('photos', 10, { storage: memoryStorage() }),
  )
  uploadPhotos(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.stadiumsService.uploadPhotos(req.user.user_id, id, files);
  }

  @Delete(':id/photos')
  deletePhoto(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Param('id') id: string,
    @Body() dto: DeletePhotoDto,
  ) {
    return this.stadiumsService.deletePhoto(req.user.user_id, id, dto.url);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStadium(
    @Request() req: ExpressRequest & { user: AuthenticatedUser },
    @Param('id') id: string,
  ) {
    return this.stadiumsService.deleteStadium(req.user.user_id, id);
  }
}

