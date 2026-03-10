import { Injectable } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, StadiumStatus } from 'generated/prisma/enums';
import { StatsPrismaClient, StatsResult } from './types/stats.types';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const roles = Object.values(Role);

    const db = this.prisma as unknown as StatsPrismaClient;

    const result = await db.$transaction(async (tx) => {
      const usersByRole = {} as Record<Role, number>;

      for (const role of roles) {
        usersByRole[role] = await tx.user.count({
          where: { role },
        });
      }

      const totalStadiums = await tx.stadium.count();
      const pendingStadiums = await tx.stadium.count({
        where: { status: StadiumStatus.PENDING },
      });

      const revenue = await tx.booking.aggregate({
        where: { status: BookingStatus.CONFIRMED },
        _sum: { totalAmount: true },
      });

      return { usersByRole, totalStadiums, pendingStadiums, revenue };
    });

    const typedResult = result as StatsResult;

    const totalUsers = Object.values(typedResult.usersByRole).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      users: {
        byRole: typedResult.usersByRole,
        totalUsers,
      },
      stadiums: {
        total: typedResult.totalStadiums,
        pending: typedResult.pendingStadiums,
      },
      revenue: {
        confirmedTotalAmount: typedResult.revenue._sum.totalAmount ?? 0,
      },
    };
  }
}
