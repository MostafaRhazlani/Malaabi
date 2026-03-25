import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlayerStadiumsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.stadium.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        images: true,
        stadiumType: true,
        priceFullMatch: true,
        priceHalfMatch: true,
      },
    });
  }
}
