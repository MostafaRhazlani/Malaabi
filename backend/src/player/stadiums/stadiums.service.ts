import { Injectable } from '@nestjs/common';
import { StadiumType } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlayerStadiumsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(type?: StadiumType) {
    return this.prisma.stadium.findMany({
      where: {
        status: 'ACTIVE',
        ...(type && { stadiumType: type }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        images: true,
        stadiumType: true,
        latitude: true,
        longitude: true,
        priceFullMatch: true,
        priceHalfMatch: true,
        startTime: true,
        endTime: true,
      },
    });
  }

  search(query?: string) {
    return this.prisma.stadium.findMany({
      where: {
        status: 'ACTIVE',
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        images: true,
        stadiumType: true,
        latitude: true,
        longitude: true,
        priceFullMatch: true,
        priceHalfMatch: true,
        startTime: true,
        endTime: true,
      },
    });
  }
}
