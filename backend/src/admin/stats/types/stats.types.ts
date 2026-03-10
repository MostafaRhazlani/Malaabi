import { BookingStatus, Role, StadiumStatus } from 'generated/prisma/enums';

export type BookingRevenueAggregate = {
  _sum: {
    totalAmount: number | null;
  };
};

export type StatsPrismaTransaction = {
  user: {
    count(args: { where: { role: Role } }): Promise<number>;
  };
  stadium: {
    count(args?: { where?: { status?: StadiumStatus } }): Promise<number>;
  };
  booking: {
    aggregate(args: {
      where: { status: BookingStatus };
      _sum: { totalAmount: true };
    }): Promise<BookingRevenueAggregate>;
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
};
