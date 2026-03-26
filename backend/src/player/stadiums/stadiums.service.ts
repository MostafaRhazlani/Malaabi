import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetPlayerStadiumsDto } from './dto/get-player-stadiums.dto';

@Injectable()
export class PlayerStadiumsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetPlayerStadiumsDto) {
    const { page = 1, limit = 10, search, city } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StadiumWhereInput = {
      status: 'ACTIVE',
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.stadium.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
          images: true,
          priceFullMatch: true,
          priceHalfMatch: true,
        },
      }),
      this.prisma.stadium.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.prisma.stadium.findUnique({
      where: { id, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        images: true,
        priceFullMatch: true,
        priceHalfMatch: true,
      },
    });
  }
}
