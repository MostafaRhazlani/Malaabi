import { BookingStatus, Role, StadiumStatus } from 'generated/prisma/enums';

export type BookingRevenueAggregate = {
  _sum: {
    totalAmount: number | null;
  };
};

export type RecentUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  createdAt: Date;
};

export type RecentBooking = {
  id: string;
  totalAmount: number;
  createdAt: Date;
  player: { first_name: string; last_name: string; email: string };
  stadium: { name: string; city: string };
};

export type StatsPrismaTransaction = {
  user: {
    count(args: { where: { role: Role } }): Promise<number>;
    findMany(args: {
      orderBy: { createdAt: 'desc' };
      take: number;
      select: {
        id: true;
        first_name: true;
        last_name: true;
        email: true;
        role: true;
        createdAt: true;
      };
    }): Promise<RecentUser[]>;
  };
  stadium: {
    count(args?: { where?: { status?: StadiumStatus } }): Promise<number>;
  };
  booking: {
    aggregate(args: {
      where: { status: BookingStatus };
      _sum: { totalAmount: true };
    }): Promise<BookingRevenueAggregate>;
    findMany(args: {
      where: { status: BookingStatus };
      orderBy: { createdAt: 'desc' };
      take: number;
      select: {
        id: true;
        totalAmount: true;
        createdAt: true;
        player: { select: { first_name: true; last_name: true; email: true } };
        stadium: { select: { name: true; city: true } };
      };
    }): Promise<RecentBooking[]>;
  };
};

export type StatsPrismaClient = {
  $transaction<T>(fn: (tx: StatsPrismaTransaction) => Promise<T>): Promise<T>;
};

export type StatsResult = {
  usersByRole: Record<Role, number>;
  totalStadiums: number;
  pendingStadiums: number;
  revenue: BookingRevenueAggregate;
  recentUsers: RecentUser[];
  recentBookings: RecentBooking[];
};
