import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { GetStadiumsDto } from './dto/get-stadiums.dto';
import { UpdateStadiumStatusDto } from './dto/update-stadium-status.dto';

@Injectable()
export class StaduimsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetStadiumsDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StadiumWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
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
          status: true,
          createdAt: true,
          manager: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
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

  async updateStatus(id: string, dto: UpdateStadiumStatusDto) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');

    return this.prisma.stadium.update({
      where: { id },
      data: { status: dto.status },
      select: { id: true, status: true },
    });
  }

  async remove(id: string) {
    const stadium = await this.prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new NotFoundException('Stadium not found');

    await this.prisma.stadium.delete({ where: { id } });
  }
}
