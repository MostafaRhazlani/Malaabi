import { Injectable } from '@nestjs/common';
import { BookingStatus, MatchType } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ManagerStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(managerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const stadiums = await this.prisma.stadium.findMany({
      where: { managerId },
      select: { id: true },
    });
    const stadiumIds = stadiums.map((s) => s.id);

    const [
      totalStadiums,
      revenue,
      totalBookings,
      fullMatches,
      halfMatches,
      recentBookings,
      upcomingBookings,
    ] = await Promise.all([
      this.prisma.stadium.count({ where: { managerId } }),

      this.prisma.booking.aggregate({
        where: {
          stadiumId: { in: stadiumIds },
          status: BookingStatus.CONFIRMED,
        },
        _sum: { totalAmount: true },
      }),

      this.prisma.booking.count({
        where: { stadiumId: { in: stadiumIds } },
      }),

      this.prisma.booking.count({
        where: {
          stadiumId: { in: stadiumIds },
          matchType: MatchType.FULL,
        },
      }),

      this.prisma.booking.count({
        where: {
          stadiumId: { in: stadiumIds },
          matchType: MatchType.HALF,
        },
      }),

      this.prisma.booking.findMany({
        where: {
          stadiumId: { in: stadiumIds },
          status: BookingStatus.CONFIRMED,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),

      this.prisma.booking.findMany({
        where: {
          stadiumId: { in: stadiumIds },
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        select: {
          id: true,
          scheduledAt: true,
          matchType: true,
          totalAmount: true,
          player: { select: { first_name: true, last_name: true } },
          stadium: { select: { name: true } },
        },
      }),
    ]);

    const weeklyMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      weeklyMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const booking of recentBookings) {
      const key = booking.createdAt.toISOString().slice(0, 10);
      if (weeklyMap.has(key)) {
        weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + booking.totalAmount);
      }
    }
    const weeklyIncome = Array.from(weeklyMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));

    return {
      totalRevenue: revenue._sum.totalAmount ?? 0,
      totalBookings,
      totalStadiums,
      matchTypeDistribution: {
        [MatchType.FULL]: fullMatches,
        [MatchType.HALF]: halfMatches,
      },
      weeklyIncome,
      upcomingBookings,
    };
  }
}
