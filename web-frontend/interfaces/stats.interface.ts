import type { UserRole } from '../types/admin.types';

export interface RecentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface RecentBooking {
  id: string;
  totalAmount: number;
  createdAt: string;
  player: { first_name: string; last_name: string; email: string };
  stadium: { name: string; city: string };
}

export interface AdminStats {
  users: {
    byRole: Record<UserRole, number>;
    totalUsers: number;
  };
  stadiums: {
    total: number;
    pending: number;
  };
  revenue: {
    confirmedTotalAmount: number;
  };
  recentActivity: {
    users: RecentUser[];
    bookings: RecentBooking[];
  };
}
