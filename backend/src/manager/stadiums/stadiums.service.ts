import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium-info.dto';
import { UpdateStadiumPricesDto } from './dto/update-stadium-prices.dto';

@Injectable()
export class ManagerStadiumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UploadService,
  ) {}

  findAll(managerId: string) {
    return this.prisma.stadium.findMany({
      where: { managerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        images: true,
        status: true,
        stadiumType: true,
        latitude: true,
        longitude: true,
        priceFullMatch: true,
        priceHalfMatch: true,
        startTime: true,
        endTime: true,
        createdAt: true,
      },
    });
  }

  create(managerId: string, dto: CreateStadiumDto) {
    return this.prisma.stadium.create({
      data: {
        name: dto.name,
        city: dto.city,
        address: dto.address,
        stadiumType: dto.stadiumType,
        latitude: dto.latitude,
        longitude: dto.longitude,
        priceFullMatch: dto.priceFullMatch ?? 0,
        priceHalfMatch: dto.priceHalfMatch ?? 0,
        startTime: dto.startTime,
        endTime: dto.endTime,
        managerId,
      },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        status: true,
        stadiumType: true,
        latitude: true,
        longitude: true,
        priceFullMatch: true,
        priceHalfMatch: true,
        startTime: true,
        endTime: true,
        images: true,
        createdAt: true,
      },
    });
  }

  async update(managerId: string, id: string, dto: UpdateStadiumDto) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.managerId !== managerId)
      throw new ForbiddenException('You do not own this stadium');

    return this.prisma.stadium.update({
      where: { id },
      data: {
        name: dto.name,
        city: dto.city,
        address: dto.address,
        stadiumType: dto.stadiumType,
        latitude: dto.latitude,
        longitude: dto.longitude,
        priceFullMatch: dto.priceFullMatch,
        priceHalfMatch: dto.priceHalfMatch,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async updatePrices(
    managerId: string,
    id: string,
    dto: UpdateStadiumPricesDto,
  ) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.managerId !== managerId)
      throw new ForbiddenException('You do not own this stadium');

    return this.prisma.stadium.update({
      where: { id },
      data: {
        ...(dto.priceFullMatch !== undefined && {
          priceFullMatch: dto.priceFullMatch,
        }),
        ...(dto.priceHalfMatch !== undefined && {
          priceHalfMatch: dto.priceHalfMatch,
        }),
      },
      select: { id: true, priceFullMatch: true, priceHalfMatch: true },
    });
  }

  async uploadPhotos(
    managerId: string,
    id: string,
    files: Express.Multer.File[],
  ): Promise<{ images: string[] }> {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.managerId !== managerId)
      throw new ForbiddenException('You do not own this stadium');

    const urls = await this.upload.saveFiles(`stadiums/${id}`, files);

    return this.prisma.stadium.update({
      where: { id },
      data: { images: [...stadium.images, ...urls] },
      select: { images: true },
    });
  }

  async deletePhoto(
    managerId: string,
    id: string,
    url: string,
  ): Promise<{ images: string[] }> {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.managerId !== managerId)
      throw new ForbiddenException('You do not own this stadium');
    if (!stadium.images.includes(url))
      throw new NotFoundException('Photo not found');

    await this.upload.deleteFile(url);

    return this.prisma.stadium.update({
      where: { id },
      data: { images: stadium.images.filter((img) => img !== url) },
      select: { images: true },
    });
  }

  async deleteStadium(managerId: string, id: string): Promise<void> {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.managerId !== managerId)
      throw new ForbiddenException('You do not own this stadium');

    await this.prisma.stadium.delete({ where: { id } });
    await this.upload.deleteFolder(`stadiums/${id}`);
  }
}

