export type MatchType = 'FULL' | 'HALF';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type StadiumStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface ManagerStats {
  totalRevenue: number;
  totalBookings: number;
  totalStadiums: number;
  matchTypeDistribution: Record<MatchType, number>;
  weeklyIncome: { date: string; amount: number }[];
  upcomingBookings: {
    id: string;
    scheduledAt: string | null;
    matchType: MatchType;
    totalAmount: number;
    player: { first_name: string; last_name: string };
    stadium: { name: string };
  }[];
}

export interface ManagerStadium {
  id: string;
  name: string;
  city: string;
  address: string;
  images: string[];
  status: StadiumStatus;
  stadiumType: string;
  latitude?: number;
  longitude?: number;
  priceFullMatch: number;
  priceHalfMatch: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface ManagerGuard {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  assignedStadium: { id: string; name: string; city: string } | null;
}

export interface ManagerBooking {
  id: string;
  totalAmount: number;
  matchType: MatchType;
  scheduledAt: string | null;
  status: BookingStatus;
  createdAt: string;
  player: { first_name: string; last_name: string; email: string };
  stadium: { name: string; city: string };
}

export interface PaginatedManagerBookings {
  data: ManagerBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
