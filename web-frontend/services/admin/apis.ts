import api from '../../lib/axios';
import type { AdminStats } from '@/interfaces/stats.interface';
import type { PaginatedUsers, UsersQueryParams } from '@/interfaces/users.interface';
import type { UserStatus } from '@/types/admin.types';

export const AdminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  getUsers: async (params: UsersQueryParams): Promise<PaginatedUsers> => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  updateUserStatus: async (id: string, status: UserStatus): Promise<void> => {
    await api.patch(`/admin/users/${id}/status`, { status });
  },
};
