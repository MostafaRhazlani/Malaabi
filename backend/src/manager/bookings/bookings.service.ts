import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetBookingsDto } from './dto/get-bookings.dto';

@Injectable()
export class ManagerBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(managerId: string, query: GetBookingsDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const stadiums = await this.prisma.stadium.findMany({
      where: { managerId },
      select: { id: true },
    });
    const stadiumIds = stadiums.map((s) => s.id);

    const where = {
      stadiumId: { in: stadiumIds },
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          totalAmount: true,
          matchType: true,
          scheduledAt: true,
          status: true,
          createdAt: true,
          player: {
            select: { first_name: true, last_name: true, email: true },
          },
          stadium: { select: { name: true, city: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
