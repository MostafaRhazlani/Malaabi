import { MatchType } from 'generated/prisma/enums';

export interface ManagerStatsResult {
  totalRevenue: number;
  totalBookings: number;
  totalStadiums: number;
  matchTypeDistribution: Record<MatchType, number>;
  weeklyIncome: { date: string; amount: number }[];
  upcomingBookings: {
    id: string;
    scheduledAt: Date | null;
    matchType: MatchType;
    totalAmount: number;
    player: { first_name: string; last_name: string };
    stadium: { name: string };
  }[];
}
