import type { UserRole } from '../types/admin.types';

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
}
